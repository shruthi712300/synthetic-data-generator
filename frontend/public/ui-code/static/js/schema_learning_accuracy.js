function create_drop_downs(global_schema) {
    /*
     * This function populates drop down select options in `add new row` section
     */
    if (global_schema == null) {
        return;
    }

    const json_global_schema = JSON.parse(global_schema);

    // Populate the global table select option in add new row section
    let is_first = true;
    for (let global_schema_info of json_global_schema) {
        $('#new_domain_entity').append('<option value="">' + global_schema_info.table_name + '</option>');
        // Populate the column selection options for first table alone
        if (is_first) {
            is_first = false;
            for (let col of global_schema_info.columns) {
                $('#new_domain_attr').append('<option value="">' + col + '</option>');
            }
        }
    }

    // Add change listener to table selection box, so that column section box options
    // are automatically updated when table selection changes
    $("#new_domain_entity").change(function () {
        $('#new_domain_attr')
            .find('option')
            .remove();

        let select_table_name = $('#new_domain_entity').find(":selected").text();

        let found = json_global_schema.find(function (element) {
            return element.table_name === select_table_name;
        });

        if (found != null) {
            for (let col of found.columns) {
                $('#new_domain_attr').append('<option value="">' + col + '</option>');
            }
        }
    });
}

function createTable(div_id) {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let app_type_key = sPageURL.split('&')[1];
    let p_id_key = sPageURL.split('&')[0];
    let w_id = p_id_key.split('=')[1];

    let app_type = app_type_key.split('=')[1];

    const schema_match_url = window.location.protocol + '//'  + window.location.host + "/schema_match/data?workflow_id=" + w_id + "&app_type=" + app_type;

    // Load the schema match table data and populate the UI table
    $.getJSON(schema_match_url, function (json) {
        let table_list = json.data;
        let table = $(div_id).DataTable();

        for (let index = 0; index < table_list.length; index++) {
            let data = table_list[index];
            let viewButton = '<button type="button" name="' + data.psm_id +
                '" id="view_details" class="btn btn-xs green sbold uppercase" data-toggle="modal" ><i class="fa fa-folder-open"></i> View</button>';

            // Highlight the corresponding 'action button' based on the value
            let is_validated = data.validated;
            let actionButton;
            if (is_validated == null) {
                actionButton = '<div class="btn-group btn-group-xs"><button type="button" id="approve" class="btn btn-xs default sbold uppercase tbl__btn-toggle btn-validate"><i class="fa fa-check"></i> Validated</button><button type="button" id="reject" class="btn btn-xs default sbold uppercase tbl__btn-toggle btn-error "><i class="fa fa-times"></i> Error</button></div>';
            }
            else if (is_validated) {
                actionButton = '<div class="btn-group btn-group-xs"><button type="button" id="approve" class="active btn btn-xs default sbold uppercase tbl__btn-toggle btn-validate"><i class="fa fa-check"></i> Validated</button><button type="button" id="reject" class="btn btn-xs default sbold uppercase tbl__btn-toggle btn-error "><i class="fa fa-times"></i> Error</button></div>';
            }
            else {
                actionButton = '<div class="btn-group btn-group-xs"><button type="button" id="approve" class="btn btn-xs default sbold uppercase tbl__btn-toggle btn-validate"><i class="fa fa-check"></i> Validated</button><button type="button" id="reject" class="btn btn-xs default sbold uppercase tbl__btn-toggle active btn-error "><i class="fa fa-times"></i> Error</button></div>';
            }

            table.row.add([
                index + 1,
                data.db_table_name,
                data.db_column_name,
                data.global_table_name,
                data.global_column_name,
                data.score,
                viewButton,
                actionButton,
            ]).draw(false);
        }
    });

    // Get the global schema information from the API and store it in the session for further operations
    if (sessionStorage.getItem('global_schema') == null) {
        $.getJSON(window.location.protocol + '//'  + window.location.host + "/globalschema", function (json) {
            let all_data = json.data;
            let table_info = null;
            let global_schema_info = [];

            for (let col_data of all_data) {
                let global_table_name = col_data.entity_name;
                if (table_info === null || global_table_name != table_info.table_name) {
                    table_info = {
                        'table_name': global_table_name,
                        'columns': []
                    };
                    global_schema_info.push(table_info);
                }

                table_info.columns.push(col_data.attribute_name);
            }
            sessionStorage.setItem('global_schema', JSON.stringify(global_schema_info));
            create_drop_downs(sessionStorage.getItem('global_schema'));
        });
    }
    else {
        create_drop_downs(sessionStorage.getItem('global_schema'));
    }
}

function create_selectable_element(options, id_value, selected_option) {
    if (options.length == 0 && selected_option != null) {
        options = [selected_option];
    }

    let viewButton = '<select class="form-control" name="select_element" id="' +
        id_value + '" data-toggle="modal" >';

    let index = 0;
    for (let col of options) {
        let first_part = '<option value="' + index++ + '"';
        if (col === selected_option) {
            first_part = first_part + ' selected';
        }
        viewButton = viewButton + first_part + '>' + col + '</option>';
    }
    viewButton = viewButton + '</select>';

    return viewButton
}

function get_psm_id(data) {
    return String(data[6]).split('name="')[1].split('"')[0];
}

$('#base_table_1 tbody').on('click', '#approve', function () {
    let table = $('#base_table_1').DataTable();
    $(this).toggleClass('active');
    if ($(this).siblings().hasClass('active')) {
        $(this).addClass('active').siblings().removeClass('active');
    }

    let data = table.row($(this).parents('tr')).data();
    let psm_id = get_psm_id(data);

    let validated_list = JSON.parse(localStorage.getItem("validated_list"));
    let error_list = JSON.parse(localStorage.getItem("error_list"));
    if ($(this).hasClass('active')) {
        $.each(error_list, function (index, value) {
            if (value == psm_id) error_list.splice(index, 1);
        });
        if ($.inArray(psm_id, validated_list) === -1) validated_list.push(psm_id);
    }
    else {
        $.each(validated_list, function (index, value) {
            if (value == psm_id) validated_list.splice(index, 1);
        });
    }
    localStorage.setItem("validated_list", JSON.stringify(validated_list));
    localStorage.setItem("error_list", JSON.stringify(error_list))
});


$('#base_table_1 tbody').on('click', '#reject', function () {
    $(this).toggleClass('active');
    if ($(this).siblings().hasClass('active')) {
        $(this).addClass('active').siblings().removeClass('active');
    }

    let table = $('#base_table_1').DataTable();
    let data = table.row($(this).parents('tr')).data();
    let psm_id = get_psm_id(data);

    let error_list = JSON.parse(localStorage.getItem("error_list"));
    let validated_list = JSON.parse(localStorage.getItem("validated_list"));

    if ($(this).hasClass('active')) {
        $.each(validated_list, function (index, value) {
            if (value == psm_id) validated_list.splice(index, 1);
        });
        if ($.inArray(psm_id, error_list) === -1) error_list.push(psm_id);
    }
    else {
        $.each(error_list, function (index, value) {
            if (value == psm_id) error_list.splice(index, 1);
        });
    }

    localStorage.setItem("error_list", JSON.stringify(error_list));
    localStorage.setItem("validated_list", JSON.stringify(validated_list))
});


$('#base_table_1 tbody').on('click', '#view_details', function () {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let app_id_key = sPageURL.split('&')[1];
    let p_id_key = sPageURL.split('&')[0];
    let p_id = p_id_key.split('=')[1];
    let app_id = app_id_key.split('=')[1];

    let table = $('#base_table_1').DataTable();
    $("#update_match_table").DataTable().clear().draw();

    let row_info = table.row($(this).parents('tr'));
    let data = row_info.data();
    let index = data[0];
    let actual_column = data[2];
    let matched_table = data[3];
    let matched_column = data[4];
    let psm_id = get_psm_id(data);

    sessionStorage.setItem('psm_id', psm_id);
    sessionStorage.setItem('curr_index', index);
    sessionStorage.setItem('actual_col', actual_column);
    sessionStorage.setItem('matched_col', matched_column);
    sessionStorage.setItem('matched_table', matched_table);

    let table_list_ = [{'column_name': actual_column}];

    let global_schema = sessionStorage.getItem('global_schema');
    let global_table_names = [];
    let global_col_names = [];

    // Populate global table names and global column names from information from session storage
    if (global_schema != null) {
        const json_global_schema = JSON.parse(global_schema);
        global_table_names = json_global_schema.map((x) => x.table_name);
        let found = json_global_schema.find(function (element) {
            return element.table_name === matched_table;
        });

        if (found != null) {
            global_col_names = found.columns;
        }
    }

    let tableNamesSelection = create_selectable_element(global_table_names, "update_table_match", matched_table);
    let colNamesSelection = create_selectable_element(global_col_names, "update_column_match", matched_column);

    let table_st = $('#update_match_table').DataTable();
    for (let index = 0; index < table_list_.length; index++) {
        let data = table_list_[index];
        table_st.row.add([
            data.column_name,
            tableNamesSelection,
            colNamesSelection,
        ]).draw(false);
    }

    $("#update_table_match").change(function () {
        $('#update_column_match')
            .find('option')
            .remove();

        let select_table_name = $('#update_table_match').find(":selected").text();
        let global_schema = sessionStorage.getItem('global_schema');
        if (global_schema != null) {
            const json_global_schema = JSON.parse(global_schema);
            let found = json_global_schema.find(function (element) {
                return element.table_name === select_table_name;
            });

            if (found != null) {
                for (let col of found.columns) {
                    $('#update_column_match').append('<option value="">' + col + '</option>');
                }
            }
        }
    });

    $("#modal__reports").modal();
});


function callRerun() {
    /*
     * This function takes the UI changes and updates the corresponding tables in database.
     * Also this will trigger retraining the model
     */

    let validated_list = JSON.parse(localStorage.getItem('validated_list'));
    let error_list = JSON.parse(localStorage.getItem('error_list'));
    let change_list = JSON.parse(sessionStorage.getItem('change_list'));

    if (error_list.length === 0 && validated_list.length === 0) {
        // No need to process further
        return 0;
    }

    let list_to_update = [];
    for (let valid_psm_id of validated_list) {
        let element_found = change_list.find((element) => element.psm_id === valid_psm_id);
        if (element_found === undefined || element_found === null) {
            list_to_update.push({'psm_id': valid_psm_id});
        }
        else {
            list_to_update.push(element_found);
        }
    }

    let data_to_post = {
        'remove_list': error_list,
        'validated': list_to_update
    };

    $.ajax({
        url: window.location.protocol + '//'  + window.location.host + "/schema_match/feedback",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data_to_post),
        success: function (response) {
            let sPageURL = decodeURIComponent(window.location.search.substring(1));
            let workflow_id_key = sPageURL.split('&')[0];
            let workflow_id = workflow_id_key.split('=')[1];

            let app_type_key = sPageURL.split('&')[1];
            let app_type = app_type_key.split('=')[1];

            let version_key = sPageURL.split('&')[2];
            let version = parseInt(version_key.split('=')[1]);

            let re_train = confirm('Do you want to re-train the model now?');

            if (response.success && re_train) {
                console.log('Updated successfully');

                $.ajax({
                    url: window.location.protocol + '//'  + window.location.host + "/schema_match/retrain?w_id=" + workflow_id + '&version=' + version,
                    type: 'GET',
                    success: function (response) {
                        if (response.success) {
                            alert('Model training process is initiated');
                            window.location.href = window.location.protocol + '//'  + window.location.host + "/workflow";
                        }
                        else {
                            console.log(JSON.stringify(response));
                            window.location.href = window.location.protocol + '//'  + window.location.host + "/workflow";
                        }
                    },
                    error: function (response) {
                        console.log(response);
                        window.location.href = window.location.protocol + '//'  + window.location.host + "/workflow";
                    }
                });
            }
            else {
                console.log(JSON.stringify(response));
                window.location.href = window.location.protocol + '//'  + window.location.host + "/workflow";
            }
        },
        error: function (response) {
            console.log(response);
        }
    });
}

function updateMatchValue() {
    let matched_col = sessionStorage.getItem('matched_col');
    let matched_table = sessionStorage.getItem('matched_table');

    let selected_column = $('#update_column_match').find(":selected").text();
    let selected_table = $('#update_table_match').find(":selected").text();


    if (matched_table === selected_table && matched_col === selected_column) {
        return;
    }

    let curr_index = parseInt(sessionStorage.getItem('curr_index'));
    let curr_row = $('#base_table_1').DataTable().row(curr_index - 1);
    let row_data = curr_row.data();

    let changed = false;
    if (matched_table !== selected_table) {
        changed = true;
        row_data[3] = selected_table;
    }

    if (matched_col !== selected_column) {
        changed = true;
        row_data[4] = selected_column;
    }

    if (changed) {
        let psm_id = get_psm_id(row_data);

        curr_row.data(row_data).draw();
        let change_list = JSON.parse(sessionStorage.getItem('change_list'));
        let element_found = change_list.find((element) => element.psm_id === psm_id);
        if (element_found === undefined || element_found == null) {
            element_found = {
                'psm_id': psm_id,
            };
            change_list.push(element_found);
        }

        element_found['table'] = selected_table;
        element_found['column'] = selected_column;
        sessionStorage.setItem('change_list', JSON.stringify(change_list));
    }
}

function addRow() {
    /*
     * This functions adds a manual schema matching.
     */
    let data_set_val = $("#add_row").find("#new_data_set").val();
    let attribute_val = $("#add_row").find("#new_attribute").val();
    let domain_entity = $('#new_domain_entity').find(":selected").text();
    let domain_attribute = $('#new_domain_attr').find(":selected").text();

    if (data_set_val.trim().length === 0 || attribute_val.trim().length === 0
        || domain_entity.trim().length === 0 || domain_attribute.trim().length === 0) {

    }

    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let workflow_id_key = sPageURL.split('&')[0];
    let workflow_id = workflow_id_key.split('=')[1];

    let app_type_key = sPageURL.split('&')[1];
    let app_type = app_type_key.split('=')[1];

    let version_key = sPageURL.split('&')[2];
    let version = version_key.split('=')[1];

    // "Score 2" indicates that the match is added manually by the user from UI
    let newObj = {
        'data': [{
            'workflow_id': workflow_id,
            'version_no': version,
            'db_table_name': data_set_val,
            'db_column_name': attribute_val,
            'global_table_name': domain_entity,
            'global_column_name': domain_attribute,
            'score': 2
        }]
    };


    $.ajax({
        url: window.location.protocol + '//'  + window.location.host + "/update_schema_matching",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newObj),
        success: function (response) {
            console.log(response.data)
        },
        error: function (response) {
            alert('error');
        }
    });
}