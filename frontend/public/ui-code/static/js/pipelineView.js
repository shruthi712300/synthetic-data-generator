saturamTileView = function () {

    function Tile(pipeline_type, pipeline_name, total_integrations, total_datacount, success, failure, pipeline_id, app_type, reconfigure, delete_flag,app_icon) {
        this.pipeline_type = pipeline_type;
        this.pipeline_name = pipeline_name;
        this.total_integrations = total_integrations;
        this.total_datacount = total_datacount;
        this.success = success;
        this.failure = failure;
        this.pipeline_id = pipeline_id;
        this.app_type = app_type;
        this.reconfigure = reconfigure;
        this.delete_flag = delete_flag;
        this.app_icon=app_icon
        return this;
    }

    function render(tileList) {
        let str1 = "../static/assets/pages/img/icons/";
        $('#pipelines').empty();

        for (let i = 0; i < tileList.length; i++) {
            let _t = $('#_dummy_pipeline').children('div.col-xs-12').clone();

            if (tileList[i].app_type == "DA_SYNDA") {
                let newString = _t.find('#data_points_title').html().replace('Rows Replicated This Month', 'Data Points Generated');
                _t.find('#data_points_title').html(newString);
            }
            else if (tileList[i].app_type == "DA_DAMSK") {
                let newString = _t.find('#data_points_title').html().replace('Rows Replicated This Month', 'Data Points Masked');
                _t.find('#data_points_title').html(newString);
            }
            else if (tileList[i].app_type == "DA_COSIS") {
                let newString = _t.find('#data_points_title').html().replace('Rows Replicated This Month', 'Data Consistency Percentage');
                _t.find('#data_points_title').html(newString);
            }
            else if (tileList[i].app_type == "DA_PIITR") {
                let newString = _t.find('#data_points_title').html().replace('Rows Replicated This Month', 'Count of PIIs Identified');
                _t.find('#data_points_title').html(newString);
            }

            _t.find('img#icon').attr("src", str1.concat(tileList[i].app_type, ".svg"));
            //_t.find('img#icon').attr("src", str1.concat(tileList[i].app_icon));
            _t.find('.monitor-thumb-subtitle').html(tileList[i].pipeline_name);
            _t.find('#total_int').html(tileList[i].total_integrations);
            _t.find('.monitor-thumb-body-stat').html(tileList[i].total_datacount);
            _t.find('#success').html(tileList[i].success);
            _t.find('#danger').html(tileList[i].failure);
            _t.find('input[name="p_id"]').attr("value", tileList[i].pipeline_id);
            _t.find('input[name="app_id"]').attr("value", tileList[i].app_type);
            _t.find('input[name="delete_flag"]').attr("value", tileList[i].delete_flag);

            if (tileList[i].reconfigure == "False" || tileList[i].app_type == "DA_MEREL") {
                _t.find('#a_reconfigure').attr("disabled", "disabled");
                //_t.find('#reconfigure').attr("value", "0");
                 _t.find('input[name="reconfigure"]').attr("value", 0);

            }
            else {
                _t.find('#a_reconfigure').removeAttr("disabled")
                _t.find('#a_reconfigure').attr("onclick", "reconfigure_pipeline(this)");
                _t.find('input[name="reconfigure"]').attr("value", 1);
               // _t.find('#reconfigure').attr("value", "1");

            }

            if (tileList[i].app_type != "DA_MEREL") {
                _t.find('#create_annotations').css("display", "none");
            }

            $('#pipelines').append(_t);

        }
    }

    return {
        render: render,
        Tile: Tile
    };
}();


$(document).ready(function () {
    $.getJSON(window.location.protocol + '//' + window.location.host + "/pipeline_details?client_id=" + localStorage.getItem("client_id") + "&pipeline_id=None", function (json) {
        let l = json.data;
        let tileList = [];

        // Do not process if the incoming data is not a list
        if (Array.isArray(l) === false) {
            return
        }

        $(l).each(function (i, item) {
            let t = new saturamTileView.Tile(item.pipeline_type, item.pipeline_name, item.total_integrations, item.total_datacount, item.success, item.failure, item.pipeline_id, item.app_type,
            item.reconfigure, item.delete_flag,item.app_icon);
            tileList.push(t);
        });
        saturamTileView.render(tileList);
    });
});

function monitor_pipeline(avalue) {
    let p_id = $(avalue).find('input[name="p_id"]').val();
    let app_type = $(avalue).find('input[name="app_id"]').val();
    let reconfigure = $(avalue).find('input[name="reconfigure"]').val();
    let delete_flag = $(avalue).find('input[name="delete_flag"]').val();
    if (app_type == "AA_CHDAA" || app_type == "AA_CSSEG" || app_type == "AA_CULFE") {
        reconfigure="0";
        window.location.href = window.location.protocol + '//' + window.location.host + "/monitorpipeline?p_id=" + p_id + "&app_type=" + app_type + "&#r=" + reconfigure + "&d=" + delete_flag;
    }
    else {
        window.location.href = window.location.protocol + '//' + window.location.host + "/monitorpipeline?p_id=" + p_id + "&app_type=" + app_type + "&#r=" + reconfigure + "&d=" + delete_flag;
    }
}

function reconfigure_pipeline(avalue) {
    let p_id = $(avalue).find('input[name="p_id"]').val();
    let app_type = $(avalue).find('input[name="app_id"]').val();
    window.location.href = window.location.protocol + '//' + window.location.host + "/datappssources?app_type=" + app_type + "&p_id=" + p_id
}

function create_annotations(avalue) {
    let p_id = $(avalue).find('input[name="p_id"]').val();
    window.location.href = window.location.protocol + '//' + window.location.host + "/createannotations?p_id=" + p_id
}
