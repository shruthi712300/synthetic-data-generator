$(document).ready(function () {

    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    const res = sPageURL.split('=')[1];
    if (res == 0) {
        let alert_element = $('.alert-danger');
        alert_element.html('Error in adding Integration');
        alert_element.show();
    }

    $.getJSON(window.location.protocol + '//' + window.location.host + "/getConnectorGroups", function (json) {
        let l = json.data;
        let tab_str = '<li class="active"> \
                <a href="#" id="brand-card-tab-all" data-toggle="tab">All Sources</a> \
              </li>';

        $.each(l, function (index, value) {
            let tab_ref_name = 'brand-card-tab-' + value.toLowerCase().replace(" ", "_");
            tab_str += '<li> \
                         <a href="#' + tab_ref_name + '" data-toggle="tab">' + value + '</a> \
                </li>';
        });
        //$('#branccard-tabs-headers').find('#tab_ul').html(tab_str);
        $('#tab_ul').html(tab_str);
    });

    $.getJSON(window.location.protocol + '//' + window.location.host + "/list_integrations?", function (json) {
        let all_integrations = json.data;
        localStorage.setItem("integrations", JSON.stringify(all_integrations));
        let tileList = [];

        $(all_integrations).each(function (i, item) {
            let t = new saturamTileView.Tile(item.app_integration_type, "", "", "allsource", "", "");
            tileList.push(t);
        });

        saturamTileView.render(tileList);

        (function ($) {
            $('#branccard-tabs-body').inlinePopup({
                itemSelector: ".brand-card"
            })
        })(jQuery)
    });

    // Brand Card Tab
    document.querySelector('#tab_ul').addEventListener('click', function (event) {
        let tab_name = event.target.textContent;
        let l = JSON.parse(localStorage.getItem("integrations"));
        let tileList = [];

        $(l).each(function (i, item) {
            let t = new saturamTileView.Tile(item.app_integration_type, "", "", tab_name, "", "");
            tileList.push(t);
        });

        saturamTileView.render(tileList);

        (function ($) {
            $('#branccard-tabs-body').inlinePopup({
                itemSelector: ".brand-card"
            })
        })(jQuery)

    });

});


function radio_button_click_handler(id) {
    if ($(id).attr('data-value') === 'inlineRadio_1') {
        $(id).closest('div[class="portlet-body"]').find('#basicAuth').show();
        $(id).closest('div[class="portlet-body"]').find('#others').hide();
        $(id).closest('div[class="portlet-body"]').find('#custom').hide();
    }
    else if ($(id).attr('data-value') === 'inlineRadio_4') {

        $(id).closest('div[class="portlet-body"]').find('#basicAuth').hide();
        $(id).closest('div[class="portlet-body"]').find('#others').hide();
        $(id).closest('div[class="portlet-body"]').find('#custom').show();
    }
    else {
        $(id).closest('div[class="portlet-body"]').find('#basicAuth').hide();
        $(id).closest('div[class="portlet-body"]').find('#others').show();
        $(id).closest('div[class="portlet-body"]').find('#custom').hide();

        if ($(id).attr('data-value') === 'inlineRadio_2'){
            $(id).closest('div[class="portlet-body"]').find('#token_key_div').show();
        } else{
            $(id).closest('div[class="portlet-body"]').find('#token_key_div').hide();
        }
    }
}


function get_auth_type(id) {

    $.getJSON(window.location.protocol + '//' + window.location.host + "/get_integration_auth_param?integration_type=facebook", function (json) {
        let data = json.data[0].integration_auth_param;
        let app_id = JSON.parse(data).App_ID;
        let app_secret = JSON.parse(data).App_Secret;
        $(id).closest('div[class="portlet-body"]').find('#h_app_id').attr("value", app_id);
        $(id).closest('div[class="portlet-body"]').find('#h_app_secret').attr("value", app_secret);
    });

    if ($(id).attr('id') === 'inlineRadio_5') {
        $(id).closest('div[class="portlet-body"]').find('#app_auth_1').show();
        $(id).closest('div[class="portlet-body"]').find('#app_auth_2').show();
        $(id).closest('div[class="portlet-body"]').find('#user_auth_1').hide();
        $(id).closest('div[class="portlet-body"]').find('#user_auth_2').hide();
    }
    else if ($(id).attr('id') === 'inlineRadio_6') {
        $(id).closest('div[class="portlet-body"]').find('#app_auth_1').hide();
        $(id).closest('div[class="portlet-body"]').find('#app_auth_2').hide();
        $(id).closest('div[class="portlet-body"]').find('#user_auth_1').show();
        $(id).closest('div[class="portlet-body"]').find('#user_auth_2').show();
    }

}


function get_file_type(sel) {
    let val = $(sel).val();

    const col_delimiter_div = $('div[name="col_delimiter_div"]');
    const row_delimiter_div = $('div[name="row_delimiter_div"]');
    const json_div = $('div[name="json_div"]');


    if (val === "csv"){
        col_delimiter_div.show();
        row_delimiter_div.show();
        let formatted_label = val[0].toUpperCase() + val.slice(1);
        json_div.find('#file_delimiter_label').html(formatted_label);
        json_div.show();
    }else if( val === "json"){
        col_delimiter_div.hide();
        row_delimiter_div.show();
        let formatted_label = val[0].toUpperCase() + val.slice(1);
        json_div.find('#file_delimiter_label').html(formatted_label);
        json_div.show();
    }
    else {
        col_delimiter_div.hide();
        row_delimiter_div.hide();
        json_div.hide();
    }
}

function get_file_type_sftp(sel) {
    let val = $(sel).val();

    const col_delimiter_div = $('div[name="col_delimiter_div"]');
    const row_delimiter_div = $('div[name="row_delimiter_div"]');
    const json_div = $('div[name="json_div"]');
    const header_div = $('div[name="csv_header"]');
    if (val === "csv") {
        header_div.show();
        row_delimiter_div.show();
        col_delimiter_div.show();
        json_div.show();
    }
    else if(val === "json") {
        header_div.hide();
        row_delimiter_div.show();
        col_delimiter_div.hide();
        json_div.show();
    }
    else {
        header_div.hide();
        row_delimiter_div.hide();
        col_delimiter_div.hide();
        json_div.hide();
    }
}

function get_file_type_azure(sel) {
    let val = $(sel).val();

    const col_delimiter_div = $('div[name="col_delimiter_div"]');
    const row_delimiter_div = $('div[name="row_delimiter_div"]');
    const json_div = $('div[name="json_div"]');
    const header_div = $('div[name="csv_header"]');
    if (val === "csv") {
        header_div.show();
        row_delimiter_div.show();
        col_delimiter_div.show();
        json_div.show();
    }
    else if(val === "json") {
        header_div.hide();
        row_delimiter_div.show();
        col_delimiter_div.hide();
        json_div.show();
    }
    else {
        header_div.hide();
        row_delimiter_div.hide();
        col_delimiter_div.hide();
        json_div.hide();
    }
}

/* -------------------  Functions for adding various integrations ------------------- */

function add_new_integration(form) {
let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });
     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;
}

function add_snowflake_integration(form) {
    const schema = $.trim($(form).find('input[name="schema"]').val());
    const warehouse = $.trim($(form).find('input[name="warehouse"]').val());

    const json_data = {
        "schema": schema,
        "warehouse": warehouse,
    };
    const data_content = JSON.stringify(json_data);
    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);

    let success = false;
    $.ajax({
        type: 'POST',
        url: window.location.protocol + '//' + window.location.host + "/add_integration",
        data: $(form).serialize(),
        async: false,
        success: function (response) {
            response = JSON.parse(response)
            if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
                success = true
            }
        }
    });
    if (success) {
        window.open("integrationstatus?res=1", "_self");
    } else {
        window.open("integrationstatus?res=0", "_self");
    }
    return false;
}


function add_s3_integration(form) {
    const aws_security_id = $.trim($(form).find('input[name="aws_security_id"]').val());
    const secret_key = $.trim($(form).find('input[name="secret_key"]').val());
    const bucket = $.trim($(form).find('input[name="bucket"]').val());
    const prefix = $.trim($(form).find('input[name="prefix"]').val());

    const file_format = $(form).find('select[name="select-input"] option:selected').val();
    const row_delimiter = $.trim($(form).find('input[name="row_delimiter"]').val());
    const column_delimiter = $.trim($(form).find('input[name="column_delimiter"]').val());

    const json_data = {
        "aws_access_key_id": aws_security_id,
        "aws_secret_access_key": secret_key,
        "bucket": bucket,
        "prefix": prefix,
        "row_delimiter": row_delimiter,
        "column_delimiter": column_delimiter,
        "filetype": file_format
    };
    const data_content = JSON.stringify(json_data);
    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);

let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });
     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;
}


function add_gcs_integration(form) {
    const gcs_security_id = $.trim($(form).find('input[name="gcs_security_id"]').val());
    const bq_projectid = $.trim($(form).find('input[name="bq_projectid"]').val());
    const gcs_bucket = $.trim($(form).find('input[name="gcs_bucket"]').val());
    const prefix = $.trim($(form).find('input[name="prefix"]').val());

    const file_format = $(form).find('select[name="select-input"] option:selected').val();
    const row_delimiter = $.trim($(form).find('input[name="row_delimiter"]').val());
    const column_delimiter = $.trim($(form).find('input[name="column_delimiter"]').val());

    // [name = json_data] is unused
    const json_data = {
        "gcs_security_id": gcs_security_id,
        "bq_projectid": bq_projectid,
        "gcs_bucket": gcs_bucket,
        "prefix": prefix,
        "row_delimiter": row_delimiter,
        "column_delimiter": column_delimiter,
        "filetype": file_format
    };

    const data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);
let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });
     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;
}


function add_big_query_integration(form) {
    const db_name = $.trim($(form).find('input[name="dbname"]').val());
    const gcs_security_id = $.trim($(form).find('input[name="gcs_security_id"]').val());
    const bq_projectid = $.trim($(form).find('input[name="bq_projectid"]').val());
    const gcs_bucket = $.trim($(form).find('input[name="gcs_bucket"]').val());

    const json_data = {
        "dbname": db_name,
        "gcs_security_id": gcs_security_id,
        "bq_projectid": bq_projectid,
        "gcs_bucket": gcs_bucket
    };

    const data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);

let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });
     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;
}


function add_twitter_integration(form) {
    const consumer_key = $.trim($(form).find('input[name="consumer_key"]').val());
    const consumer_secret = $.trim($(form).find('input[name="consumer_secret"]').val());

    const json_data = {
        "consumer_key": consumer_key,
        "consumer_secret": consumer_secret,
        "auth_type": "header",
        "headers": {"Content-Type": "application/json"},
        "header_type": "Authorization",
        "header_name": "Bearer"
    };

    const data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);

    let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });
     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;

}


function add_facebook_integration(form) {
    let json_data;
    let app_secret;
    let app_id;
    const radios = $(form).find('input[name="Auth"]:checked').val();

    if (radios === "app_auth") {
        if ($(form).find('input[name="saturam_app"]:checked').val() === "1") {
            app_id = $.trim($(form).find('#h_app_id').val());
            app_secret = $.trim($(form).find('#h_app_secret').val());
        }
        else {
            app_id = $.trim($(form).find('input[name="app_id"]').val());
            app_secret = $.trim($(form).find('#app_secret').val());
        }
        const access_token = app_id.concat("|").concat(app_secret);
        json_data = {"access_token": access_token};

    }
    else if (radios === "user_auth") {
        let user_token;

        if ($(form).find('#user_auth_1').find("i.font-green").hasClass("fa fa-check")) {
            user_token = $.trim($(form).find('#h_user_access').val());
        }
        else {
            user_token = $.trim($(form).find('input[name="user_token"]').val());
        }
        json_data = {"access_token": user_token};
    }

    const data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);
    let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });
     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;
}


function add_instagram_integration(form) {
    const user_token = $.trim($(form).find('input[name="user_token"]').val());
    const json_data = {"access_token": user_token};
    const data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);
let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });
     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;

}


function add_other_integration(form) {
    let data_content;
    const radios = $(form).find('input[name="Auth"]:checked').val();
    const api_type = $(form).find('select[name="api_type"] option:selected').val();

    if (radios === "basic") {
        const username = $.trim($(form).find('input[name="basicauth_1"]').val());
        const password = $.trim($(form).find('input[name="basicauth_2_password"]').val());
        const json_data = {
            "auth_type": radios,
            "headers": {"Content-Type": "application/json"},
            "user": username,
            "pass": password,
            "api_type": api_type
        };
        data_content = JSON.stringify(json_data);
    }
    else if (radios === "custom") {
        data_content = $.trim($(form).find('textarea[name="custom_json"]').val());
    }
    else {
        const token = $.trim($(form).find('input[name="others_1_token"]').val());
        let json_data = {
            "auth_type": radios,
            "headers": {"Content-Type": "application/json"},
            "header_type": "Authorization",
            "header_name": "Bearer",
            "token": token,
            "api_type": api_type
        };
        if (radios === "url_token"){
            // If authentication type is 'url_token', get the token identifier to be used
            // For ex in Fixer API => http://data.fixer.io/api/latest?access_key=API_KEY
            // The access_key is the 'token_key_value' given by the user.

            const token_key_value = $.trim($(form).find('input[name="url_token_key"]').val());
            if ( token_key_value.length > 0 ){
                json_data["header_name"] = token_key_value;
            }
        }
        data_content = JSON.stringify(json_data);
    }

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);
let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });
     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;
}


function add_hadoop_integration(form) {
    const auth_mechanism = $.trim($(form).find('select[name="auth_mech"] option:selected').val());
    const json_data = {"auth_mechanism": auth_mechanism};
    const data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);
    let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });
     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;
}


function get_security_kafka(sel) {
    let val = $(sel).val();
    if (val == "SASL_SSL") {
        $('div#credentials').show();
    }
    else {
        $('div#credentials').hide();
    }
}


function add_new_kafka(form) {
    let data_content;
    let kafka_security = $.trim($(form).find('#kafka_security option:selected').val());
    let entity_name = $.trim($(form).find("#entity_name").val());
    if (kafka_security == "SASL_SSL") {
        let username = $.trim($(form).find("#username").val());
        let password = $.trim($(form).find("#password").val());
        let json_data = {
            "entity_name": entity_name,
            "security": kafka_security,
            "user": username,
            "pass": password
        };
        data_content = JSON.stringify(json_data);
    }
    else {
        let json_data = {"entity_name": entity_name, "security": kafka_security};
        data_content = JSON.stringify(json_data);
    }

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);
let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });
     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;
}

function add_sftp_integration(form) {
    let data_content;
    let folder_path = $.trim($(form).find("#folder_path").val());
    let file_format = $(form).find('select[name="select-input"] option:selected').val();
    let column_delimiter = $.trim($(form).find('input[name="column_delimiter"]').val());
    let row_delimiter = $.trim($(form).find('input[name="row_delimiter"]').val());
    let json_data = {
            "folder_path": folder_path,
            "row_delimiter": row_delimiter,
            "column_delimiter": column_delimiter,
            "filetype": file_format
        };
    data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);
let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });
     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;
}


function add_azure_blob_integration(form) {
    let storage_name = $.trim($(form).find('input[name="storage_name"]').val());
    let sec_key = $.trim($(form).find('input[name="secret_key"]').val());
    let bucket = $.trim($(form).find('input[name="bucket"]').val());
    let sub_path = $.trim($(form).find('input[name="sub_path"]').val());
    let file_type = $.trim($(form).find('select[name="select-input"] option:selected').val());
    let column_delimiter = $.trim($(form).find('input[name="column_delimiter"]').val());
    let row_delimiter = $.trim($(form).find('input[name="row_delimiter"]').val());
    let json_data = {
            "storage_name": storage_name,
            "secret_key": sec_key,
            "bucket": bucket,
            "sub_path": sub_path,
            "row_delimiter": row_delimiter,
            "column_delimiter": column_delimiter,
            "filetype": file_type
        };
    data_content = JSON.stringify(json_data);

    $('<input type="hidden" name="extra"/>').val(data_content).appendTo(form);
    console.log(data_content)
    console.log( $(form).serialize())
let success = false;
$.ajax({
       type: 'POST',
       url: window.location.protocol + '//' + window.location.host + "/add_integration",
       data: $(form).serialize(),
       async:false,
       success:function(response){
          response=JSON.parse(response)
          if (response["status_code"] === "200" || response["status_code"] === "SUCCESS:200") {
          success = true
        }
        }
     });

     if(success){
      window.open("integrationstatus?res=1", "_self");
    }else
    {
     window.open("integrationstatus?res=0", "_self");
    }
    return false;
}

function ValidateSize(file) {
        var FileSize = file.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 300) {
        $(".alert-danger").show();
        $('button[name=save_integration]').prop("disabled", true);
        }else
        {
        $(".alert-danger").hide();
        $('button[name=save_integration]').prop("disabled", false);
        }
    }

function remove_file()
{
$(".alert-danger").hide();
$('button[name=save_integration]').prop("disabled", false);
}


/* -------------------  End ------------------- */
