// Load the available destinations and render them
$(document).ready(function () {

    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let res = sPageURL.split('=')[1];

    if (res == 1) {

        let alert_element = $('.alert-success');
        alert_element.html('Destination Added Successfully');
        alert_element.show();
        setTimeout(() => alert_element.fadeOut(), 3000);
    }
    else if (res == 0) {
        let alert_element = $('.alert-danger');
        alert_element.html('Error in adding Destination');
        alert_element.show();
    }

    $.getJSON(window.location.protocol + '//'  + window.location.host + "/list_destinations?", function (json) {
        let all_destinations = json.data;
        let tileList = [];

        $(all_destinations).each(function (i, item) {
            let t = new saturamTileView.Tile(item.app_destination_type, "", "", "alldestination", "", "");
            tileList.push(t);
        });

        saturamTileView.render(tileList);

        $("#brandcard-container").inlinePopup({
            itemSelector: ".brand-card"
        });

    });
});

/* Methods for storing the destination information to database */

function add_s3_destination(form) {
    const sec_id = $.trim($(form).find('input[name="aws_security_id"]').val());
    const sec_key = $.trim($(form).find('input[name="secret_key"]').val());
    const bucket = $.trim($(form).find('input[name="bucket"]').val());
    const file_type = $.trim($(form).find('select[name="select-input"] option:selected').val());
    const json_data = {
        "aws_security_id": sec_id,
        "secret_key": sec_key,
        "bucket": bucket,
        "filetype": file_type
    };
    const data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo('form');

    $.post("/add_destination", $(form).serialize(), function (json) {
        const response_status = json["status_code"];

        if (response_status === "SUCCESS:200" || response_status === "200" || response_status === 200) {
            window.open("availabledestination?res=1", "_self");
        }
        else {
            window.open("availabledestination?res=0", "_self");
        }
    }, 'json');

    return false;
}

function add_adl_destination(form) {
    const sec_id = $.trim($(form).find('input[name="adl_client_id"]').val());
    const sec_key = $.trim($(form).find('input[name="secret_key"]').val());
    const bucket = $.trim($(form).find('input[name="bucket"]').val());
    const tenant_id = $.trim($(form).find('input[name="tenant_id"]').val());
    const file_type = $.trim($(form).find('select[name="select-input"] option:selected').val());
    const json_data = {
        "adl_client_id": sec_id,
        "secret_key": sec_key,
        "bucket": bucket,
        "tenant_id": tenant_id,
        "filetype": file_type
    };
    const data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo('form');

    $.post("/add_destination", $(form).serialize(), function (json) {
        const response_status = json["status_code"];

        if (response_status === "SUCCESS:200" || response_status === "200" || response_status === 200) {
            window.open("availabledestination?res=1", "_self");
        }
        else {
            window.open("availabledestination?res=0", "_self");
        }
    }, 'json');

    return false;
}

function add_azure_blob_destination(form) {
    const storage_name = $.trim($(form).find('input[name="storage_name"]').val());
    const sec_key = $.trim($(form).find('input[name="secret_key"]').val());
    const bucket = $.trim($(form).find('input[name="bucket"]').val());
    const sub_path = $.trim($(form).find('input[name="sub_path"]').val());
    const file_type = $.trim($(form).find('select[name="select-input"] option:selected').val());
    const json_data = {
        "storage_name": storage_name,
        "secret_key": sec_key,
        "bucket": bucket,
        "sub_path": sub_path,
        "filetype": file_type
    };
    const data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo('form');

    $.post("/add_destination", $(form).serialize(), function (json) {
        const response_status = json["status_code"];

        if (response_status === "SUCCESS:200" || response_status === "200" || response_status === 200) {
            window.open("availabledestination?res=1", "_self");
        }
        else {
            window.open("availabledestination?res=0", "_self");
        }
    }, 'json');

    return false;
}

function add_gcs_destination(form) {
    const gcs_security_id = $.trim($(form).find('input[name="gcs_security_id"]').val());
    const bq_project_id = $.trim($(form).find('input[name="bq_projectid"]').val());
    const gcs_bucket = $.trim($(form).find('input[name="gcs_bucket"]').val());
    const file_format = $.trim($(form).find('select[name="select-input"] option:selected').val());

    const json_data = {
        "gcs_security_id": gcs_security_id,
        "bq_projectid": bq_project_id,
        "gcs_bucket": gcs_bucket,
        "filetype": file_format
    };

    const data_content = JSON.stringify(json_data);
    $('<input type="hidden" name="extra"/>').val(data_content).appendTo('form');

    $.post("/add_destination", $(form).serialize(), function (json) {
        const response_status = json["status_code"];

        if (response_status === "SUCCESS:200" || response_status === "200" || response_status === 200) {
            window.open("availabledestination?res=1", "_self");
        }
        else {
            window.open("availabledestination?res=0", "_self");
        }
    }, 'json');
    return false;
}

function add_new_destination(form) {
    const sec_id = $.trim($(form).find('input[name="aws_security_id"]').val());
    const sec_key = $.trim($(form).find('input[name="secret_key"]').val());
    const bucket = $.trim($(form).find('input[name="bucket"]').val());
    const json_data = {"aws_security_id": sec_id, "secret_key": sec_key, "bucket": bucket};
    const data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo('form');

    $.post("/add_destination", $(form).serialize(), function (json) {
        const response_status = json["status_code"];

        if (response_status === "SUCCESS:200" || response_status === "200" || response_status === 200) {
            window.open("availabledestination?res=1", "_self");
        }
        else {
            window.open("availabledestination?res=0", "_self");
        }

    }, 'json');
    return false;
}

function add_postgres_destination(form) {
/*
 *   This function is also used for adding MySQL destination
 */
    console.log("inside postgres destination function");
    const schema = $.trim($(form).find('input[name="schema"]').val());
    const json_data = {"schema": schema};
    const data_content = JSON.stringify(json_data);
    $('<input type="hidden" name="extra"/>').val(data_content).appendTo('form');

    $.post("/add_destination", $(form).serialize(), function (json) {
        const response_status = json["status_code"];

        if (response_status === "SUCCESS:200" || response_status === "200" || response_status === 200) {
            window.open("availabledestination?res=1", "_self");
        }
        else {
            window.open("availabledestination?res=0", "_self");
        }

    }, 'json');
    return false;
}

/* ------------------------------------------------------------ */
