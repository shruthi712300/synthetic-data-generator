// ---------- Helpers ----------
function renderUserAvatars(additionalUsers = []) {
    const userCount = additionalUsers.length;
    const avatarLimit = 4;
    let avatarHtml = '';

    for (let i = 0; i < Math.min(avatarLimit, userCount); i++) {
        const username = additionalUsers[i] || '';
        let initials = username.charAt(0).toUpperCase();
        const underscoreIndex = username.indexOf('_');
        if (underscoreIndex !== -1 && underscoreIndex + 1 < username.length) {
            initials += username.charAt(underscoreIndex + 1).toUpperCase();
        }
        avatarHtml += `
            <div class="user-card__avatar custom-tooltip-container">
                <div class="user-initials">${initials}</div>
                <div class="custom-tooltip-content">${username}</div>
            </div>`;
    }

    const remaining = userCount - avatarLimit;
    if (remaining > 0) {
        const remainingUsers = additionalUsers.slice(avatarLimit);
        avatarHtml += `
            <div class="user-card__avatar custom-tooltip-container">
                +${remaining}
                <div class="custom-tooltip-content">
                    <ul class="role-permission-list mb-0" style="padding-left: 15px; margin-bottom: 0;">
                        ${remainingUsers.map(u => `<li>${u}</li>`).join('')}
                    </ul>
                </div>
            </div>`;
    }

    return `
        <div class="user-card__users mb-0">
            <div class="user-card__users-count">${userCount} ${userCount === 1 ? 'user' : 'users'}</div>
            <div class="user-card__avatars">${avatarHtml}</div>
        </div>`;
}

function formatCreatedAt(createdAtRaw) {
    // Prefer ISO for sorting, pretty for display
    let iso = '';
    let pretty = '';

    if (window.moment) {
        const m = moment(createdAtRaw);
        if (m.isValid()) {
            iso = m.format('YYYY-MM-DD');
            pretty = m.format('MMMM D, YYYY');
        }
    }

    // Fallbacks if moment not present or invalid
    if (!iso) {
        try {
            const d = new Date(createdAtRaw);
            if (!isNaN(d.getTime())) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                iso = `${yyyy}-${mm}-${dd}`;
                pretty = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            }
        } catch (_) {}
    }

    // Absolute last resort
    if (!iso) iso = createdAtRaw || '';
    if (!pretty) pretty = createdAtRaw || '';

    // Use data-order to sort by ISO while displaying pretty
    return `<span data-order="${iso}">${pretty}</span>`;
}

function formatQuery(query) {
    if (!query) return '';

    // Add line breaks before SQL keywords (case-insensitive)
    return query
        .replace(/\b(SELECT)\b/i, '\n$1')
        .replace(/\b(FROM)\b/i, '\n$1')
        .replace(/\b(WHERE)\b/i, '\n$1')
        .trim();
}

function messageRow(text, colSpan = 6) {
    // Single-cell row spanning all columns (DataTables needs 6 cells, so we fill the first and leave rest empty)
    const cells = [ `<span class="text-muted">${text}</span>` ];
    while (cells.length < colSpan) cells.push('');
    return cells;
}

// ---------- Data loading ----------
function loadEndpointDetails() {
    const email = localStorage.getItem('username');

    if (!email) {
        const table = $('#endpointTable').DataTable();
        table.clear().row.add(messageRow('Username not found in localStorage')).draw();
        return;
    }

    const table = $('#endpointTable').DataTable();
    table.clear().row.add(messageRow('Loading endpoint details...')).draw();
    // table.row.add(messageRowCentered('Loading endpoint details...', table.columns().count())).draw();


    $.ajax({
        url: '/my-endpoint-details',
        type: 'GET',
        data: { email },
        success: function (response) {
            table.clear();

            if (response && response.code === 200 && response.success) {
                const data = Array.isArray(response.data) ? response.data : [];

                if (data.length === 0) {
                    table.row.add(messageRow('No endpoint is found for you...')).draw();
                    return;
                }

                data.forEach(function (item) {
                    const endpointName = item.endpoint_name || '-';
                    const createdCell = formatCreatedAt(item.created_at || '');
                    const createdBy = item.created_by || '-';
                    const usersCell = renderUserAvatars(item.additional_users || []);

                    const queryBtn = `
                        <button class="btn btn-sm btn-light show-query-btn"
                            data-toggle="modal"
                            data-target="#myEndpointQueryModal"
                            data-endpoint="${endpointName}"
                            data-query="${(item.query || '').replace(/"/g, '&quot;')}">
                            Show Query
                        </button>
                    `;

                    const actions = `
                        <div class="d-flex align-items-center">
                            <i class="btn-icon tooltip delete-endpoint-btn"
                               data-toggle="modal"
                               data-target="#myWarningModal"
                               data-endpoint="${endpointName}"
                               title="Delete">
                               <span class="lucide-icon icon-trash-2 fs-14 text-error"></span>
                            </i>
                        </div>
                    `;

                    table.row.add([
                        `<strong>${endpointName}</strong>`,
                        createdCell,
                        createdBy,
                        usersCell,
                        queryBtn,
                        actions
                    ]);
                });

                table.draw();
            } else {
                table.row.add(messageRow('Failed to load endpoint details. Please try again.')).draw();
            }
        },
        error: function (xhr) {
            const table = $('#endpointTable').DataTable();
            table.clear();

            if (xhr && xhr.status === 404) {
                table.row.add(messageRow('No endpoint is found for you...')).draw();
            } else if (xhr && xhr.status === 500) {
                table.row.add(messageRow('Server error (500). Please try again later.')).draw();
            } else {
                table.row.add(messageRow('Endpoint details request failed. Please check your connection and try again.')).draw();
            }
        }
    });
}

function loadSharedEndpointDetails() {
    const email = localStorage.getItem('username');

    if (!email) {
        const table = $('#sharedEndpointTable').DataTable();
        table.clear().row.add(messageRow('Username not found in localStorage')).draw();
        return;
    }

    const table = $('#sharedEndpointTable').DataTable();
    table.clear().row.add(messageRow('Loading shared endpoint details...')).draw();

    $.ajax({
        url: '/shared-endpoint-details',
        type: 'GET',
        data: { email },
        success: function (response) {
            table.clear();

            if (response && response.code === 200 && response.success) {
                const data = Array.isArray(response.data) ? response.data : [];

                if (data.length === 0) {
                    table.row.add(messageRow('No shared endpoint is available for you...')).draw();
                    return;
                }

                data.forEach(function (item) {
                    const endpointName = item.endpoint_name || '-';
                    const createdCell = formatCreatedAt(item.created_at || '');
                    const createdBy = item.created_by || '-';
                    const usersCell = renderUserAvatars(item.additional_users || []);

                    const queryBtn = `
                        <button class="btn btn-sm btn-light show-query-btn"
                            data-toggle="modal"
                            data-target="#myEndpointQueryModal"
                            data-endpoint="${endpointName}"
                            data-query="${(item.query || '').replace(/"/g, '&quot;')}">
                            Show Query
                        </button>
                    `;

                    table.row.add([
                        `<strong>${endpointName}</strong>`,
                        createdCell,
                        createdBy,
                        usersCell,
                        queryBtn
                    ]);
                });

                table.draw();
            } else {
                table.row.add(messageRow('Failed to load shared endpoint details. Please try again.')).draw();
            }
        },
        error: function (xhr) {
            const table = $('#sharedEndpointTable').DataTable();
            table.clear();

            if (xhr && xhr.status === 404) {
                table.row.add(messageRow('No shared endpoint is available for you...')).draw();
            } else if (xhr && xhr.status === 500) {
                table.row.add(messageRow('Server error (500). Please try again later.')).draw();
            } else {
                table.row.add(messageRow('Shared endpoint details request failed. Please check your connection and try again.')).draw();
            }
        }
    });
}

function deleteEndpoint() {
    const endpointName = localStorage.getItem('selected-endpoint');
    if (!endpointName) {
        alert('No endpoint selected for deletion.');
        return;
    }

    $.ajax({
        url: '/delete-endpoint?endpointName=' + encodeURIComponent(endpointName),
        method: 'DELETE',
        success: function (response) {
            $('#myWarningModal').modal('hide');
            localStorage.removeItem('selected-endpoint');
            showCustomToast({
                type: 'success',
                title: 'Endpoint Deleted Successfully',
                description: 'All the details have been deleted and the details have been sent to the additional users...',
                iconUrl: '../static/assets/pages/img/icon_success-outlined.svg',
                action1: 'Dismiss'
            });

            // Wait 1 second, then refresh the table
            setTimeout(function () {
                location.reload();
            }, 1000); // 1000ms = 1 second
        },
        error: function (xhr) {
            alert('Error deleting endpoint: ' + xhr.responseText);
            localStorage.removeItem('selected-endpoint');
        }
    });
}

// ---------- Init ----------
$(document).ready(function () {
    // Make sure table/tbody aren’t hidden before init
    $('#endpointTable').removeClass('hide');
    $('#endpointTableBody').empty();

    // Compute non-sortable columns from header (empty header cells)
    const nonSortableColumns = [];
    $('#endpointTable thead th').each(function (index) {
        if ($(this).text().trim() === '') nonSortableColumns.push(index);
    });


    // Initialize DataTable once with a "Loading..." row
    const dt = $('#endpointTable').DataTable({
        data: [ messageRow('Loading endpoint details...') ],
        // Use existing thead for titles, so no `columns` needed here
        columnDefs: [
            { targets: nonSortableColumns, orderable: false },
            { 
                targets: 1, // Created Date column
                render: function (data, type, row) {
                    if (type === 'sort') {
                        // Extract the ISO date from data-order="..."
                        const match = data.match(/data-order="([^"]+)"/);
                        return match ? match[1] : data;
                    }
                    return data; // display pretty format normally
                }
            }
        ],
        order: [[1, 'desc']], 
        language: {
            search: "",
            searchPlaceholder: "Search"
        },
        info: true,
        lengthChange: false,
        pageLength: 5,
        paging: true, 
        initComplete: function () {
            // Move filter to your custom container (once)
            const sharedFilter = $('#endpointTable_wrapper .dataTables_filter');
            const sharedControls = $('#my_endpoints .dataTable-controls');
            if (sharedControls.length && sharedFilter.length && sharedControls.find('.dataTables_filter').length === 0) {
                sharedFilter.appendTo(sharedControls);
            }

            // Wrap with .table-responsive if not already
            if (!$('#endpointTable').parent().hasClass('table-responsive')) {
                $('#endpointTable').wrap('<div class="table-responsive"></div>');
            }
        }
    });

    // -------- Date range filtering for "My Endpoints" (Created Date is column index 1) --------
    // Extract ISO from data-order when available, else try to parse text
    $.fn.dataTable.ext.search.push(function (settings, data /*, dataIndex */) {
        if (settings.nTable.id !== 'endpointTable') return true;

        // Column 1 (Created Date) will be HTML like: <span data-order="YYYY-MM-DD">Pretty</span>
        const cellHtml = data[1] || '';
        let iso = null;

        const m = cellHtml.match(/data-order="([^"]+)"/);
        if (m && m[1]) {
            iso = m[1];
        } else {
            // Fallback: strip HTML tags and parse with moment if present
            const text = cellHtml.replace(/<[^>]*>/g, '').trim();
            if (window.moment) {
                const mt = moment(text, ['MMMM D, YYYY', 'YYYY-MM-DD'], true);
                if (mt.isValid()) iso = mt.format('YYYY-MM-DD');
            }
        }

        if (!iso) return true; // if we can't parse, don't filter it out

        const date = window.moment ? moment(iso, 'YYYY-MM-DD') : null;
        if (!date) return true;

        // myMinDate / myMaxDate are defined below (scoped in ready)
        if (window.myMinDate && date.isBefore(window.myMinDate, 'day')) return false;
        if (window.myMaxDate && date.isAfter(window.myMaxDate, 'day')) return false;
        return true;
    });

    // Expose date bounds so the ext.search above can read them
    window.myMinDate = null;
    window.myMaxDate = null;

    // Date range picker for My Endpoints
    $('#config-demo').daterangepicker({
        parentEl: 'body',
        opens: 'center',
        alwaysShowCalendars: true,
        autoUpdateInput: false,
        locale: { 
            format: 'DD-MM-YYYY',
            applyLabel: 'Apply',
            cancelLabel: 'Clear',
            fromLabel: 'From',
            toLabel: 'To',
            customRangeLabel: 'Custom',
        },
        ranges: {
            'Today': [moment().startOf('day'), moment().endOf('day')],
            'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
            'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
            'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, function (start, end) {
        // Ensure we're comparing at day precision
        window.myMinDate = start.startOf('day');
        window.myMaxDate = end.endOf('day');
        $('#config-demo').val(start.format('DD-MM-YYYY') + ' - ' + end.format('DD-MM-YYYY'));
        $('#endpointTable').DataTable().draw();
    });

    $('#config-demo').on('cancel.daterangepicker', function () {
        $(this).val('');
        window.myMinDate = null;
        window.myMaxDate = null;
        $('#endpointTable').DataTable().draw();
    });
    // Load data now (table already shows "Loading...")
    loadEndpointDetails();

    let isSharedDataLoaded = false;

    $('#sharedEndpointsTab').on('click', function () {
        $('#my_endpoints').hide();
        $('#shared_endpoints').show();
        $('#sharedEndpointTable').removeClass('hide');

        if (!isSharedDataLoaded) {
            // Initialize Shared Table if not done
            const nonSortableColumns = [];
            $('#sharedEndpointTable thead th').each(function (index) {
                if ($(this).text().trim() === '') nonSortableColumns.push(index);
            });

            $('#sharedEndpointTable').DataTable({
                data: [ messageRow('Loading shared endpoint details...') ],
                columnDefs: [
                    { targets: nonSortableColumns, orderable: false },
                    { 
                        targets: 1, // Created Date column
                        render: function (data, type, row) {
                            if (type === 'sort') {
                                // Extract the ISO date from data-order="..."
                                const match = data.match(/data-order="([^"]+)"/);
                                return match ? match[1] : data;
                            }
                            return data; // display pretty format normally
                        }
                    }
                ],
                order: [[1, 'desc']],
                language: {
                    search: "",
                    searchPlaceholder: "Search"
                },
                info: true,
                lengthChange: false,
                pageLength: 5,
                paging: true,
                initComplete: function () {
                    const sharedFilter = $('#sharedEndpointTable_wrapper .dataTables_filter');
                    const sharedControls = $('#shared_endpoints .dataTable-controls');
                    if (sharedControls.length && sharedFilter.length && sharedControls.find('.dataTables_filter').length === 0) {
                        sharedFilter.appendTo(sharedControls);
                    }

                    if (!$('#sharedEndpointTable').parent().hasClass('table-responsive')) {
                        $('#sharedEndpointTable').wrap('<div class="table-responsive"></div>');
                    }
                }
            });

            // Date filter for Shared Endpoints (Created Date = column index 1)
            $.fn.dataTable.ext.search.push(function (settings, data) {
                if (settings.nTable.id !== 'sharedEndpointTable') return true;

                const cellHtml = data[1] || '';
                let iso = null;

                const m = cellHtml.match(/data-order="([^"]+)"/);
                if (m && m[1]) {
                    iso = m[1];
                } else {
                    const text = cellHtml.replace(/<[^>]*>/g, '').trim();
                    if (window.moment) {
                        const mt = moment(text, ['MMMM D, YYYY', 'YYYY-MM-DD'], true);
                        if (mt.isValid()) iso = mt.format('YYYY-MM-DD');
                    }
                }

                if (!iso) return true;

                const date = window.moment ? moment(iso, 'YYYY-MM-DD') : null;
                if (!date) return true;

                if (window.sharedMinDate && date.isBefore(window.sharedMinDate, 'day')) return false;
                if (window.sharedMaxDate && date.isAfter(window.sharedMaxDate, 'day')) return false;
                return true;
            });

            window.sharedMinDate = null;
            window.sharedMaxDate = null;

            $('#config-demo_1').daterangepicker({
                parentEl: 'body',
                opens: 'center',
                alwaysShowCalendars: true,
                autoUpdateInput: false,
                locale: { format: 'DD-MM-YYYY' },
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, function (start, end) {
                window.sharedMinDate = start;
                window.sharedMaxDate = end;
                $('#config-demo_1').val(start.format('DD-MM-YYYY') + ' - ' + end.format('DD-MM-YYYY'));
                $('#sharedEndpointTable').DataTable().draw();
            });

            $('#config-demo_1').on('cancel.daterangepicker', function () {
                $(this).val('');
                window.sharedMinDate = null;
                window.sharedMaxDate = null;
                $('#sharedEndpointTable').DataTable().draw();
            });

            // Now load actual data
            loadSharedEndpointDetails();
            isSharedDataLoaded = true;
        }
    });

    $('#myEndpointsTab').on('click', function () {
        $('#shared_endpoints').hide();
        $('#my_endpoints').show();
    });

    $('#alert_delete_btn').on('click', function () {
        // delete endpoint
        deleteEndpoint();
    });

});

// ---------- Delegated events ----------
$(document).on('click', '.show-query-btn', function () {
    const endpointName = $(this).data('endpoint');
    const query = $(this).data('query');

    // Set endpoint name
    $('#myEndpointQueryModal .modal-body .form-group:eq(0) pre span').text(endpointName);

    // Set SQL query
    const formattedQuery = formatQuery(query);

    const queryLines = formattedQuery.split('\n');
    const queryContainer = $('#myEndpointQueryModal .modal-body .form-group:eq(1) pre');
    queryContainer.empty();
    queryLines.forEach(line => {
        queryContainer.append(`<span>${line.trim()}</span><br>`);
    });

    // copy
    $(".icon-copy-clipboard").off('click.copy').on("click.copy", function () {
        const $codeMirror = $(this).closest(".code-mirror");
        const codeText = $codeMirror.find("pre span").map(function () {
            return $(this).text();
        }).get().join('\n');
        navigator.clipboard.writeText(codeText);
    });
});

$(document).on('click', '.delete-endpoint-btn', function () {
    const endpointName = $(this).data('endpoint');
    localStorage.setItem('selected-endpoint', endpointName);
});

// Optional: close modal button wiring (kept from your code)
$(document).on("click", ".modal-close", function () {
    $("#myEndpointQueryModal").modal("hide");
});