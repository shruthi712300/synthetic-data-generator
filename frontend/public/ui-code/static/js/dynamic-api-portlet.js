// Utility: convert "2025-06-24 15:24:43" to "June 24, 2025"

let typingTimer;
const doneTypingInterval = 2000; // 2 seconds

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    if (isNaN(date)) return dateTimeStr; // Fallback to raw if parsing fails

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function checkAllMandatoryFields() {
    const schema = $('#schemaName').val().trim();
    const table = $('#tableName').val().trim();
    // const source = $('#sourceColumns').val().trim();
    // const filter = $('#filterColumns').val().trim();
    const user = $('#userNameInput').val().trim(); // note: this is userNameInput, not userName
    const email = $('#userEmailInput').val().trim(); // same here

    if (schema && table && user && email) {
        $('#createEndpointBtn').prop('disabled', false);
    } else {
        $('#createEndpointBtn').prop('disabled', true);
    }
}

// creating the endpoint
function handleCreate() {
    const schema = $('#schemaName').val().trim();
    const table = $('#tableName').val().trim();
    const source = $('#sourceColumns').val().trim();
    const filter = $('#filterColumns').val().trim();
    const user = $('#userNameInput').val().trim();
    const email = $('#userEmailInput').val().trim();
    const endpointName = $('#endpointName').val().trim();

    // Clear previous error messages
    $('.error-msg').text('');
    $('#fieldsError').text('');

    // Basic frontend check
    if (!schema || !table || !user || !email) {
        $('#fieldsError').text("Please fill all mandatory fields.");
        return;
    }

    const payload = {
        schema_name: schema,
        table_name: table,
        created_by: user,
        user_email: email,
        endpoint_name: endpointName,
        filter_columns: filter,
        select_columns: source
    };

    $('#createTextBlock').addClass('visibility-hidden');
    $('#createLoader').removeClass('visibility-hidden');

    $.ajax({
        url: '/generate-endpoint',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (response) {
            $('#createLoader').addClass('visibility-hidden');
            $('#createTextBlock').removeClass('visibility-hidden');

            if (response.success === true) {
                $('.inlinepopup').addClass('display-none');
                showCustomToast({
                type: 'success',
                title: 'Endpoint Created Successfully',
                description: 'The endpoint details have been sent to your Gmail inbox.',
                iconUrl: '../static/assets/pages/img/icon_success-outlined.svg',
                action1: 'Dismiss'
                });
                // $('#successModal').modal('show');
                //Clear all input fields
                $('#schemaName, #tableName, #sourceColumns, #filterColumns, #userName, #userEmail, #endpointName').val('');
                $('#userName').addClass('hide');
                $('#userEmail').addClass('hide');
                $('#endpointName').addClass('hide');

                setTimeout(function() {
                    location.reload();
                }, 1500);
                return;
                
            }
        },
        error: function (xhr) {
            $('#createLoader').addClass('visibility-hidden');
            $('#createTextBlock').removeClass('visibility-hidden');
            $('.error-msg').text(''); // Clear previous error messages

            let errorMsg = "An error occurred.";
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMsg = xhr.responseJSON.error;

                if (errorMsg.includes('Schema')) {
                    // Handle "Schema xyz not found"
                    $('#schemaNameError').text(errorMsg);
                } else if (errorMsg.includes('Table')) {
                    // Handle "Table abc not found in schema xyz"
                    $('#tableNameError').text(errorMsg);
                } else if (errorMsg.includes('Column')) {
                    // Handle "Column xyz not found in table"
                    const match = errorMsg.match(/Column ([^ ]+)/);
                    if (match && match[1]) {
                        const colName = match[1];
                        const sourceCols = $('#sourceColumns').val().trim().split(',').map(col => col.trim());
                        const filterCols = $('#filterColumns').val().trim().split(',').map(col => col.trim());

                        if (sourceCols.includes(colName)) {
                            $('#sourceColumnsError').text(errorMsg);
                        } else if (filterCols.includes(colName)) {
                            $('#filterColumnsError').text(errorMsg);
                        } else {
                            $('#sourceColumnsError').text(errorMsg);
                            $('#filterColumnsError').text(errorMsg);
                        }
                    } else {
                        $('#sourceColumnsError').text(errorMsg);
                        $('#filterColumnsError').text(errorMsg);
                    }
                } else {
                    // General fallback error message
                    // $('#responseMsg').text(errorMsg);
                    // General fallback — use toast here
                    $('.inlinepopup').addClass('display-none');
                
                    showCustomToast({
                        type: 'error',
                        title: 'Request Failed',
                        description: errorMsg,
                        iconUrl: '../static/assets/pages/img/icon_failed-outline.svg',
                        action1: 'Dismiss'
                    });
                }
            } else {
                // $('#responseMsg').text(errorMsg);
                // No JSON error from server — treat as general error
                $('.inlinepopup').addClass('display-none');
                showCustomToast({
                    type: 'error',
                    title: 'Server Error',
                    description: errorMsg,
                    iconUrl: '../static/assets/pages/img/icon_error-outlined.svg',
                    action1: 'Dismiss'
                });
            }
        }
    });
}

function resetExistingEndpointSelection() {
    $('.existing-endpoint').removeClass('card-selected');
    $('#notifyCheckbox').prop('checked', false);
    $('#userName, #userEmail').addClass('hide');
    $('#userNameInput, #userEmailInput, #endpointName').val('');

    $('#userNameLabel').contents().filter(function () {
        return this.nodeType === 3;
    }).first().replaceWith('User Name ');

    $('#userEmailLabel').contents().filter(function () {
        return this.nodeType === 3;
    }).first().replaceWith('User Email ');

    $('#createEndpointBtn span.d-flex').html(`
        <span class="lucide-icon icon-check btn-icon-primary-light mr-5"></span>
        Create Endpoint
    `);
    checkAllMandatoryFields();
}

function checkEndpoint() {
    const schema = $('#schemaName').val().trim();
    const table = $('#tableName').val().trim();
    const select = $('#sourceColumns').val().trim();
    const filter = $('#filterColumns').val().trim();

    if (!schema || !table) {
        return;
    }
    // 🔹 Always reset the selection before checking
    resetExistingEndpointSelection();

    const payload = {
        schema_name: schema,
        table_name: table,
        select_columns: select,
        filter_columns: filter
    };

    $('#responseMsg').text('');
    $('#existingEndpoint').addClass('hide');
    $('#userName, #userEmail, #endpointName').addClass('hide');
    $('#existingEndpointSkeleton').removeClass('hide')[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

    $.ajax({
        url: '/check-endpoint',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (response) {
            $('#existingEndpointSkeleton').addClass('hide');
            if (response.success && response.data && response.data.endpoint_name) {
                const name = response.data.endpoint_name || '-';
                const createdBy = response.data.created_by || 'Unknown';
                const createdAtRaw = response.data.created_at || '';
                const createdAtFormatted = formatDateTime(createdAtRaw);

                $('#userName, #userEmail, #endpointName').addClass('hide');
                $('#userNameInput, #userEmailInput, #endpointName').val('');

                $('#existingEndpoint').removeClass('hide');
                $('#existingLink').text(name);
                $('#existingEndpoint .existing-endpoint__meta').html(`Created by ${createdBy} <span class="dot"></span> ${createdAtFormatted}`);
                checkAllMandatoryFields();
            } else {
                $('#existingEndpoint').addClass('hide');
                $('#existingLink').empty();
                $('#userName, #userEmail, #endpointName').removeClass('hide');

                const storedUsername = localStorage.getItem('loggedInUsername');
                const storedEmail = localStorage.getItem('username');
                if (storedUsername) $('#userNameInput').val(storedUsername).attr('readonly', true);
                if (storedEmail) $('#userEmailInput').val(storedEmail).attr('readonly', true);
                checkAllMandatoryFields();

            }
        },
        error: function (xhr) {
            $('#existingEndpointSkeleton').addClass('hide');

            $('#existingEndpoint').addClass('hide');
            $('#schemaNameError, #tableNameError, #sourceColumnsError, #filterColumnsError').text('');

            let errorMsg = "An error occurred.";
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMsg = xhr.responseJSON.error;
                if (errorMsg.includes('Schema')) {
                    $('#schemaNameError').text(errorMsg);
                } else if (errorMsg.includes('Table')) {
                    $('#tableNameError').text(errorMsg);
                } else if (errorMsg.includes('Column')) {
                    const match = errorMsg.match(/Column ([^ ]+)/);
                    const sourceCols = select.split(',').map(col => col.trim());
                    const filterCols = filter.split(',').map(col => col.trim());
                    if (match && match[1]) {
                        const colName = match[1];
                        if (sourceCols.includes(colName)) {
                            $('#sourceColumnsError').text(errorMsg);
                        } else if (filterCols.includes(colName)) {
                            $('#filterColumnsError').text(errorMsg);
                        } else {
                            $('#sourceColumnsError, #filterColumnsError').text(errorMsg);
                        }
                    } else {
                        $('#sourceColumnsError, #filterColumnsError').text(errorMsg);
                    }
                } else {
                    $('#tableNameError').text(errorMsg);
                }
            } else {
                $('#tableNameError').text(errorMsg);
            }
        }
    });
}

function notifyAdditionalUser() {
    const name = $('#userNameInput').val().trim();
    const email = $('#userEmailInput').val().trim();
    const endpointName = $('#existingLink').text().trim();

    const payload = {
        endpoint_name: endpointName,
        additional_user: name,
        additional_user_emailid: email
    };

    // Show loader
    $('#createTextBlock').addClass('visibility-hidden');
    $('#createLoader').removeClass('visibility-hidden');

    $.ajax({
        url: '/consume-endpoint',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (response) {
            $('#createTextBlock').removeClass('visibility-hidden');
            $('#createLoader').addClass('visibility-hidden');

            if (response.success) {
                $('.inlinepopup').addClass('display-none');
                // Success toast
                showCustomToast({
                    type: 'success',
                    title: 'User Notified Successfully',
                    description: 'The additional user has been added to the endpoint.',
                    iconUrl: '../static/assets/pages/img/icon_success-outlined.svg',
                    action1: 'Dismiss'
                });

                // Reset fields
                $('#schemaName, #tableName, #sourceColumns, #filterColumns, #userName, #userEmail').val('');
                $('#userNameLabel').contents().filter(function () {
                    return this.nodeType === 3;
                }).first().replaceWith('User Name ');
                $('#userEmailLabel').contents().filter(function () {
                    return this.nodeType === 3;
                }).first().replaceWith('User Email ');

                $('#existingEndpoint').addClass('hide');
                $('#userName').addClass('hide');
                $('#userEmail').addClass('hide');

                $('#createEndpointBtn span.d-flex').html(`
                    <span class="lucide-icon icon-check btn-icon-primary-light mr-5"></span>
                    Create Endpoint
                `);

                checkAllMandatoryFields();
                return;
            } else {
                $('.inlinepopup').addClass('display-none');
                // Error toast for API response error
                showCustomToast({
                    type: 'error',
                    title: 'Failed to Notify User',
                    description: response.message || response.error || 'Unknown error occurred.',
                    iconUrl: '../static/assets/pages/img/icon_failed-outline.svg',
                    action1: 'Dismiss'
                });
            }
        },
        error: function (xhr) {
            $('#createTextBlock').removeClass('visibility-hidden');
            $('#createLoader').addClass('visibility-hidden');

            let errorMsg = 'Failed to notify user. Please try again.';
            if (xhr.status === 409 && xhr.responseJSON) {
                errorMsg = xhr.responseJSON.error || 'User already added to this endpoint.';
            }
            $('.inlinepopup').addClass('display-none');

            // ❌ Error toast for AJAX failure
            showCustomToast({
                type: 'error',
                title: 'Request Failed',
                description: errorMsg,
                iconUrl: '../static/assets/pages/img/icon_failed-outline.svg',
                action1: 'Dismiss'
            });
            
            // Reset form fields in error case too
            $('#schemaName, #tableName, #sourceColumns, #filterColumns, #userName, #userEmail').val('');
            $('#userNameLabel').contents().filter(function () {
                return this.nodeType === 3;
            }).first().replaceWith('User Name ');
            $('#userEmailLabel').contents().filter(function () {
                return this.nodeType === 3;
            }).first().replaceWith('User Email ');

            $('#existingEndpoint').addClass('hide');
            $('#userName').addClass('hide');
            $('#userEmail').addClass('hide');

            $('#createEndpointBtn span.d-flex').html(`
                <span class="lucide-icon icon-check btn-icon-primary-light mr-5"></span>
                Create Endpoint
            `);

            checkAllMandatoryFields();
        }
    });
}

$(document).ready(function () {

    // Click anywhere on the card EXCEPT the checkbox/label area -> manually toggle
    $(document).on('click', '.existing-endpoint', function (e) {
        // If the click is inside the checkbox/label area, let the label/checkbox handle it
        if ($(e.target).closest('.checkbox-custom').length) return;

        const $checkbox = $(this).find('.existing-endpoint-input');
        $checkbox.prop('checked', !$checkbox.prop('checked')).trigger('change');
    });

    // Checkbox state changed (either by direct click or by card click above)
    $(document).on('change', '.existing-endpoint-input', function () {
        const $card = $(this).closest('.existing-endpoint');
        const isSelected = this.checked;

        // Keep visual selection in sync
        $card.toggleClass('card-selected', isSelected);

        if (isSelected) {
            $('#userName, #userEmail').removeClass('hide');

            $('#userNameLabel').contents().filter(function () {
                return this.nodeType === 3;
            }).first().replaceWith('Additional User Name ');

            $('#userEmailLabel').contents().filter(function () {
                return this.nodeType === 3;
            }).first().replaceWith('Additional User Email ');

            const storedUsername = localStorage.getItem('loggedInUsername');
            const storedEmail = localStorage.getItem('username');
            if (storedUsername) $('#userNameInput').val(storedUsername).attr('readonly', true);
            if (storedEmail) $('#userEmailInput').val(storedEmail).attr('readonly', true);

            $('#createEndpointBtn span.d-flex').html(`
                <span class="lucide-icon icon-check btn-icon-primary-light mr-5"></span>
                Notify User
            `);
            // Scroll into view when selected
            document.getElementById('userName').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        } else {
            $('#userName, #userEmail').addClass('hide');
            $('#userNameInput, #userEmailInput, #endpointName').val('');

            $('#userNameLabel').contents().filter(function () {
                return this.nodeType === 3;
            }).first().replaceWith('User Name ');

            $('#userEmailLabel').contents().filter(function () {
                return this.nodeType === 3;
            }).first().replaceWith('User Email ');

            $('#createEndpointBtn span.d-flex').html(`
                <span class="lucide-icon icon-check btn-icon-primary-light mr-5"></span>
                Create Endpoint
            `);
        }

        checkAllMandatoryFields();
    });



    $('#createEndpointBtn').on('click', function () {
        const buttonLabel = $('#createTextBlock').text().trim();

        if (buttonLabel.includes('Notify User')) {
            notifyAdditionalUser(); // Call this if label is "Notify User"
        } else if (buttonLabel.includes('Create Endpoint')) {
            handleCreate(); // Call this if label is "Create Endpoint"
        }
    });


    // $('#filterColumns').on('input', function () {
    //     clearTimeout(typingTimer);
    //     typingTimer = setTimeout(function () {
    //         checkEndpoint(); // call the function
    //     }, doneTypingInterval);
    // });

    // $('#filterColumns').on('keydown', function () {
    //     clearTimeout(typingTimer); // cancel timer if user types again
    // });

    function setupTypingCheck(selector) {
        $(selector).on('input', function () {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(function () {
                checkEndpoint();
            }, doneTypingInterval);
        });

        // $(selector).on('keydown', function () {
        //     clearTimeout(typingTimer);
        // });
    }

    // Apply to all typing fields that should trigger API check
    setupTypingCheck('#filterColumns');
    setupTypingCheck('#tableName');
    setupTypingCheck('#sourceColumns');

    // Listen for input changes on mandatory fields
    $('#schemaName, #tableName, #sourceColumns, #filterColumns').on('input', checkAllMandatoryFields);

    // Cancel button to close the popup
    $('#cancelBtn').on('click', function () {
        $('.inlinepopup').addClass('display-none');
    });
    $('.inlinepopupClose').on('click', function () {
            $('.inlinepopup').addClass('display-none');
    })

    // Validate input fields on blur
    // $('.type').on('blur', function () {
    //     const input = $(this);
    //     const value = input.val().trim();
    //     const errorId = `#${input.attr('id')}Error`;

    //     if (!value) {
    //         input.addClass('is-invalid');
    //         $(errorId).text('This field is required.');
    //     } else {
    //         input.removeClass('is-invalid');
    //         $(errorId).text('');
    //     }
    // });

    $('.type').on('blur', function () {
        const input = $(this);
        const id = input.attr('id');
        const value = input.val().trim();
        const errorId = `#${id}Error`;

        // Skip validation for optional fields
        if (id === 'sourceColumns' || id === 'filterColumns') {
            input.removeClass('is-invalid');
            $(errorId).text('');
            return;
        }

        if (!value) {
            input.addClass('is-invalid');
            $(errorId).text('This field is required.');
        } else {
            input.removeClass('is-invalid');
            $(errorId).text('');
        }
    });

    //clear error on typing
    $('.type').on('input', function () {
        $(this).removeClass('is-invalid');
        const errorId = `#${$(this).attr('id')}Error`;
        $(errorId).text('');
    });

    // remove inputs and error fields when create endpoint button is clicked
    $('#create_endpoint').on('click', function () {
        // Show the popup
        $('.inlinepopup').removeClass('display-none');

        // Clear all input fields
        $('#schemaName').val('');
        $('#tableName').val('');
        $('#sourceColumns').val('');
        $('#filterColumns').val('');
        $('#userNameInput').val('').removeAttr('readonly');
        $('#userEmailInput').val('').removeAttr('readonly');
        $('#endpointName').val('');

        // Clear all error messages
        $('.error-msg').text('');
        $('#responseMsg').text('').removeClass('text-success text-error');
        $('#fieldsError').text('');

        // Uncheck notify checkbox
        $('#notifyCheckbox').prop('checked', false);

        // Hide existing endpoint section
        $('#existingEndpoint').addClass('hide');

        // Hide user/email/endpoint sections
        $('#userName').addClass('hide');
        $('#userEmail').addClass('hide');
        $('#endpointName').addClass('hide');

        $('input').removeClass('is-invalid');
        $('textarea').removeClass('is-invalid');
    });

});


