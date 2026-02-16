
// creating the endpoint
function handleCreate() {
    const schema = $('#schemaName').val().trim();
    const table = $('#tableName').val().trim();
    const source = $('#sourceColumns').val().trim();
    const filter = $('#filterColumns').val().trim();
    const user = $('#userName').val().trim();
    const email = $('#userEmail').val().trim();
    const endpointName = $('#endpointName').val().trim();

    // Clear previous error messages
    $('.error-msg').text('');
    $('#responseMsg').text('');

    // Basic frontend check
    if (!schema || !table || !source || !filter || !user || !email) {
        $('#responseMsg').text("Please fill all mandatory fields.");
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

    $('#createLoader').show();

    $.ajax({
        url: '/generate-endpoint',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (response) {
            $('#createLoader').hide();

            if (response.success === true) {
                $('#successModal').modal('show');
                //Clear all input fields
                $('#schemaName, #tableName, #sourceColumns, #filterColumns, #userName, #userEmail, #endpointName').val('');
                $('#existingEndpoint').addClass('hidden');
                $('#existingLink').empty();
                return;
            }

            // Check for existing endpoint
            if (response.existing_endpoint) {
                $('#existingEndpoint').removeClass('hidden');
                $('#existingLink').html(`<a href="#">${response.existing_endpoint}</a>`);
            } else {
                $('#existingEndpoint').addClass('hidden');
            }
        },
        error: function (xhr) {
            $('#createLoader').hide();
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
                    $('#responseMsg').text(errorMsg);
                }
            } else {
                $('#responseMsg').text(errorMsg);
            }
        }
    });
}

// Notifying additional user
function notifyAdditionalUser() {
    const name = $('#additionalUserName').val().trim();
    const email = $('#additionalUserEmail').val().trim();
    const endpointName = $('#existingLink a').text().trim();

    if (!name || !email) {
        alert("Please enter additional user details.");
        return;
    }

    if (!endpointName) {
        alert("No endpoint found to notify user.");
        return;
    }

    const payload = {
        endpoint_name: endpointName,
        additional_user: name,
        additional_user_emailid: email
    };

    // Show loader and clear message
    $('#notifyLoader').show();
    $('#notifyMsg').text('');

    $.ajax({
        url: '/consume-endpoint',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (response) {
                $('#notifyLoader').hide();
            if (response.success) {
                $('#successModal').modal('show');
                $('#schemaName, #tableName, #sourceColumns, #filterColumns, #additionalUserName, #additionalUserEmail').val('');
                $('#notifyMsg').text(`✅ ${response.message}`);
            } else {
                $('#notifyMsg').text(`❌ Failed: ${response.message}`);
            }
        },
        error: function (xhr) {
            $('#notifyLoader').hide(); 
            console.error('Error notifying additional user:', xhr);
            $('#notifyMsg').text('❌ Failed to notify user. Check console for details.');
        }
    });
}


$(document).ready(function () {

    // On blur, check if input is empty
    $('.required').on('blur', function () {
        const input = $(this);
        const value = input.val().trim();
        const errorId = `#${input.attr('id')}Error`;

        if (!value) {
            input.addClass('is-invalid');
            $(errorId).text('This field is required.');
        } else {
            input.removeClass('is-invalid');
            $(errorId).text('');
        }
    });

    //clear error on typing
    $('.required').on('input', function () {
        $(this).removeClass('is-invalid');
        const errorId = `#${$(this).attr('id')}Error`;
        $(errorId).text('');
    });
    
    // cheching if the endpoint already exists
    $('#userName').on('focus', function () {
        const schema = $('#schemaName').val().trim();
        const table = $('#tableName').val().trim();
        const select = $('#sourceColumns').val().trim();
        const filter = $('#filterColumns').val().trim();

        // Only check if all required fields are filled
        if (!schema || !table || !select || !filter) {
            return;
        }

        const payload = {
            schema_name: schema,
            table_name: table,
            select_columns: select,
            filter_columns: filter
        };

        $.ajax({
            url: '/check-endpoint',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (response) {
                if (response.success && response.data && response.data.endpoint_name) {
                    $('#existingEndpoint').removeClass('hidden');
                    $('#existingLink').html(`<a href="#">${response.data.endpoint_name}</a>`);
                } else {
                    $('#existingEndpoint').addClass('hidden');
                    $('#existingLink').empty();
                }
            },
            error: function (xhr) {
                console.error('Check endpoint failed:', xhr);
                $('#existingEndpoint').addClass('hidden');

                // Clear previous errors
                $('#schemaNameError, #tableNameError, #sourceColumnsError, #filterColumnsError').text('');

                let errorMsg = "An error occurred.";
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;

                    // Match based on backend error message
                    if (errorMsg.includes('Schema')) {
                        $('#schemaNameError').text(errorMsg);
                    } else if (errorMsg.includes('Table')) {
                        $('#tableNameError').text(errorMsg);
                    } else if (errorMsg.includes('Column')) {
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
                                // Fallback to both
                                $('#sourceColumnsError').text(errorMsg);
                                $('#filterColumnsError').text(errorMsg);
                            }
                        } else {
                            // Generic fallback
                            $('#sourceColumnsError').text(errorMsg);
                            $('#filterColumnsError').text(errorMsg);
                        }
                    } else {
                        // General fallback
                        $('#tableNameError').text(errorMsg);
                    }
                } else {
                    $('#tableNameError').text(errorMsg);
                }
            }

        });
    });

    // Populate the endpoint dropdown
    function populateEndpointDropdown() {
        const $dropdown = $('#endpointDropdown');
        
        $.ajax({
            url: '/list-endpoints',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                $dropdown.empty();
                
                if (data.success && data.data && data.data.length > 0) {
                    $.each(data.data, function(index, endpoint) {
                        $dropdown.append($('<option>', {
                            value: endpoint,
                            text: endpoint
                        }));
                    });
                } else {
                    $dropdown.append($('<option>', {
                        text: 'No endpoints found',
                        disabled: true
                    }));
                }
            },
            error: function() {
                $dropdown.empty().append($('<option>', {
                    text: 'Error loading endpoints',
                    disabled: true
                }));
            }
        });
    }

    // Display endpoint details
    function displayEndpointDetails() {
        const $dropdown = $('#endpointDropdown');
        const $table = $('#endpointTable');
        const $tbody = $('#endpointTableBody');
        
        $tbody.empty();
        
        if ($dropdown.val() && $dropdown.val().length > 0) {
            $tbody.append('<tr><td colspan="5" class="text-center">Loading endpoint details...</td></tr>');
            $table.removeClass("hidden");
            
            $dropdown.val().forEach(function(endpointName) {
                $.ajax({
                    url: '/endpoint-details',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        endpoint_name: endpointName
                    }),
                    success: function(data) {
                        $tbody.find('td:contains("Loading")').parent().remove();
                        
                        if (data.success && data.data) {
                            const endpoint = data.data;
                            const $row = $(`
                                <tr>
                                    <td>${endpoint.endpoint_name}</td>
                                    <td>${endpoint.created_by}</td>
                                    <td><code>${endpoint.query}</code></td>
                                    <td>${endpoint.created_at}</td>
                                    <td>${endpoint.additional_users}</td>
                                </tr>
                            `);
                            $tbody.append($row);
                        } else {
                            $tbody.append(`
                                <tr>
                                    <td>${endpointName}</td>
                                    <td colspan="4" class="text-danger">Error: ${data.message || 'Failed to fetch details'}</td>
                                </tr>
                            `);
                        }
                    },
                    error: function() {
                        $tbody.find('td:contains("Loading")').parent().remove();
                        $tbody.append(`
                            <tr>
                                <td>${endpointName}</td>
                                <td colspan="4" class="text-danger">Error: Failed to load details</td>
                            </tr>
                        `);
                    }
                });
            });
        } else {
            $table.addClass("hidden");
        }
    }

    // function to initialize endpoint search
    function initEndpoints() {
        // Search functionality for dropdown
        $('#endpointSearch').on('input', searchDropdownEndpoints);
        
        // Keyboard shortcut (press 'S' to focus search)
        $(document).on('keydown', function(e) {
            if ((e.key === 's' || e.key === 'S') && 
                !$(e.target).is('#endpointSearch') &&
                !$(e.target).is('input:not(#endpointSearch)') &&
                !$(e.target).is('textarea') &&
                !$(e.target).is('select')) {
                e.preventDefault();
                $('#endpointSearch').focus().select();
            }
        });
        
        // Bind event handler
        $('#endpointDropdown').on('change', displayEndpointDetails);
    }

    // searching and highlighting endpoints
    function searchDropdownEndpoints() {
        const searchTerm = $(this).val().toLowerCase();
        const $dropdown = $('#endpointDropdown');
        const $options = $dropdown.find('option');
        const regex = new RegExp(searchTerm, 'gi');
        
        if (!searchTerm) {
            $options.show();
            return;
        }
        
        $options.each(function() {
            const optionText = $(this).text().toLowerCase();
            const matches = optionText.includes(searchTerm);
            $(this).toggle(matches);
            
            // Highlight matching text (optional)
            if (matches && searchTerm) {
                const highlightedText = $(this).text().replace(regex, match => 
                    `<span class="highlight">${match}</span>`);
                $(this).html(highlightedText);
            } else {
                $(this).text($(this).text()); // Reset text
            }
        });
    }

    // Initialize
    initEndpoints();
    populateEndpointDropdown();

    // creating endpoint button click handler
    $('#createEndpointBtn').on('click', handleCreate);
    // Notify additional user button click handler
    $('#notifyAdditionalUserBtn').on('click', notifyAdditionalUser);
});

