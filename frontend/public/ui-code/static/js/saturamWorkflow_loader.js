$(document).ready(function () {
    $.getJSON(window.location.protocol + '//' + window.location.host + "/workflow_details?client_id=" + localStorage.getItem("client_id") + "&workflow_id=None", function (json) {

        let all_data = json.data;

        let tileList = [];

        $(all_data).each(function (i, item) {

            let appId = item.app_id;
            if (appId === undefined) {
                appId = "DA_DAINT"
            }

            let reconfigure = "False";
            let deleteFlag = "False";
            let tile = new saturamTileViewWorkflow.Tile(item.workflow_name, item.version_no, item.workflow_id, appId, reconfigure, deleteFlag, item.has_dag);
            tileList.push(tile);
        });
        saturamTileViewWorkflow.render(tileList);
    });
});


function redirect_to_monitor_workflow(anchor_value) {
    let workflow_id = $(anchor_value).find('[name=workflow_id]').val();
    let app_id = $(anchor_value).find('[name=app_type]').val();
    let reconfigure = $(anchor_value).find('[name=reconfigure]').val();
    let delete_flag = $(anchor_value).find('[name=delete_flag]').val();
    let version = $(anchor_value).find('[name=version_no]').val();

    if (app_id == "30" || app_id == "43" || app_id == "44") {
        reconfigure = "0";
    }

    window.location.href = window.location.protocol + '//' + window.location.host + "/monitorworkflow?w_id=" + workflow_id + "&app_id=" + app_id + "&ver=" + version + "&#r=" + reconfigure + "&d=" + delete_flag;
}


function reconfigure_workflow(anchor_value) {
    let workflow_id = $(anchor_value).find('[name=workflow_id]').val();
    // TODO: Not implemented yet
}


function show_matched_schema(anchor_value, parent) {
    let workflow_id = $(anchor_value).find('[name=workflow_id]').val();
    let app_type = $(anchor_value).find('[name=app_type]').val();
    let version = $(anchor_value).find('[name=version_no]').val();

    if (parent === 'table') {
        window.location.href = window.location.protocol + '//' + window.location.host + "/schema_match/show?workflow_id=" + workflow_id + "&app_type=" + app_type + '&ver=' + version;
    }
    else if (parent === 'entities') {
        window.location.href = window.location.protocol + '//' + window.location.host + "/schema_match/entities?workflow_id=" + workflow_id + "&app_type=" + app_type + '&ver=' + version;
    }
}

function delete_workflow(anchor_value) {
    let workflow_id = $(anchor_value).find('[name=workflow_id]').val();

    let data = JSON.stringify({workflow_id: workflow_id});
    $.ajax({
        url: window.location.protocol + '//' + window.location.host + "/delete_workflow",
        type: 'post',
        data: data,
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            if (response["status"] == "200" || response["status"] == "SUCCESS:200") {
                $('.alert-success').html(response["message"]);
                $('.alert-success').show();

                // Hide the workflow tile which is deleted
                $(anchor_value).closest("div.col-xs-12").css("display", "none");

                setTimeout(function () {
                    $('.alert-success').fadeOut();
                }, 1000);
            }
            else {
                $('.alert-danger').html(response["message"]);
                $('.alert-danger').show();
                setTimeout(function () {
                    $('.alert-danger').fadeOut();
                }, 1000);
            }
        }
    });
}

function view_reports(url) {
    window.open(url, '_blank');
}