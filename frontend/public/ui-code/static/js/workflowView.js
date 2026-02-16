saturamTileViewWorkflow = function () {

    function Tile(workflow_name, version_no, workflow_id, app_id, reconfigure, delete_flag, has_dag) {
        this.workflow_name = workflow_name;
        this.version_no = version_no;
        this.workflow_id = workflow_id;
        this.app_id = app_id;
        this.reconfigure = reconfigure;
        this.delete_flag = delete_flag;
        this.has_dag = has_dag;
        return this;
    }

    // This is for the latest screen given by Sasi (Around November 2019)
    function render_latest(tileList) {

        $('#workflows').empty();

        for (let i = 0; i < tileList.length; i++) {
            let _t = $('#_dummy_workflow').children('div.col-xs-12').clone();
            let app_id = tileList[i].app_id;
            let workflow_id = tileList[i].workflow_id;

            if (tileList[i].has_dag === true) {
                _t.find('[data-value=monitor_workflow]').css('display', 'block');
            }

            _t.find('#workflow_title').html(tileList[i].workflow_name);
            _t.find('[name=workflow_id]').attr("value", workflow_id);
            _t.find('[name=app_type]').attr("value", app_id);
            _t.find('[name=delete_flag]').attr("value", tileList[i].delete_flag);
            _t.find('[name=version_no]').attr("value", tileList[i].version_no);


            if (tileList[i].reconfigure == "False" || app_id == "42") {
                _t.find('[data-value=a_reconfigure]').attr("disabled", "disabled");
                _t.find('[data-value=a_reconfigure]').prop("onclick", null).off("click");
                _t.find('[name=reconfigure]').attr("value", "0");
            }
            else {
                // _t.find('[data-value=a_reconfigure]').attr("onclick", "reconfigure_pipeline(this)");
                _t.find('[name=reconfigure]').attr("value", "1");
            }

            _t.find('[data-value=a_view_report]').attr("onclick", 'view_reports("https://reports.saturam.com/superset/dashboard/55/")');
            _t.find('[data-value=a_view_report]').prop("onclick", null).off("click");

            // Re-trigger the tooltips present in the cloned element
            _t.find("i.tooltips").tooltip();

            // Append the newly created workflow tile to the parent element
            $('#workflows').append(_t);
        }
    }

    // This corresponds to the previous workflow integration similar to pipeline
    function render(tileList) {

        $('#workflows').empty();
        let str1 = "../static/assets/pages/img/icons/";

        for (let i = 0; i < tileList.length; i++) {
            let _t = $('#_dummy_workflow').children('div.col-xs-12').clone();
            let app_id = tileList[i].app_id;
            let workflow_id = tileList[i].workflow_id;

            if (tileList[i].has_dag === true) {
                _t.find('#monitor_workflow').css('display', 'block');
                // _t.find('#a_reconfigure').css('display', 'inline-block');
            }
            _t.find('#a_show_schema').css('display', 'inline-block');
            $( "span[name='a_show_schema']" ).css('display', 'inline-block');
            _t.find('#a_view_entity').css('display', 'inline-block');
            $( "span[name='a_view_entity']" ).css('display', 'inline-block');

            _t.find('img#icon').attr("src", str1.concat(app_id, ".svg"));
            _t.find('.monitor-thumb-subtitle').html(tileList[i].workflow_name);

            if (app_id == "57") {
                _t.find('.monitor-thumb-body-stat').html("75%");
            }
            else if (app_id == "58") {
                _t.find('.monitor-thumb-body-stat').html("10");
            }

            _t.find('#success').html(tileList[i].success);
            _t.find('#danger').html(tileList[i].failure);
            _t.find('#workflow_title').html(tileList[i].workflow_name);
            _t.find('[name=workflow_id]').attr("value", workflow_id);
            _t.find('[name=app_type]').attr("value", app_id);
            _t.find('[name=delete_flag]').attr("value", tileList[i].delete_flag);
            _t.find('[name=version_no]').attr("value", tileList[i].version_no);

            if (tileList[i].reconfigure == "False" || app_id == "42") {
                _t.find('#a_reconfigure').attr("disabled", "disabled");
                _t.find('#reconfigure').attr("value", "0");
            }
            else {
                _t.find('#a_reconfigure').attr("onclick", "reconfigure_pipeline(this)");
                _t.find('#reconfigure').attr("value", "1");
            }

            if (app_id != "42") {
                _t.find('#create_annotations').css("display", "none");
            }

            $('#workflows').append(_t);
        }
    }

    return {
        render: render,
        Tile: Tile
    };
}();
