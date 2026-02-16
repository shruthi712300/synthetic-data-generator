saturamNotificationTileView = function () {

    function Tile(integration_id, integration_name, integration_status, integration_text, integration_type) {
        this.integration_id = integration_id;
        this.integration_name = integration_name;
        this.integration_status = integration_status;
        this.integration_text = integration_text;
        this.integration_type = integration_type;
        return this;
    }

    function render(tileList) {

        $('#notifications').empty();

        for (let i = 0; i < tileList.length; i++) {
            let _t;

            if (tileList[i]["integration_status"] == "success") {
                _t = $('#notification_template_success').children('div[name="tile"]').clone();
                _t.find('div[name="tile_inner"]').parent().addClass("alert-success");
                _t.find('div[name="tile_inner"]').addClass("alert-success");
                _t.find('i[name="icons"]').addClass("fa fa-check");
                _t.find('strong[name="msg_text"]').html("Success!");
            }
            else if (tileList[i]["integration_status"] == "warning") {
                _t = $('#notification_template_warning').children('div[name="tile"]').clone();
                _t.find('div[name="tile_inner"]').parent().addClass("alert-danger");
                _t.find('div[name="tile_inner"]').addClass("alert-danger");
                _t.find('i[name="icons"]').addClass("fa fa-exclamation-triangle");
                _t.find('strong[name="msg_text"]').html("Error!");
            }
            _t.find('input[name="integration_id"]').attr("value", tileList[i]["integration_id"]);
            _t.find('p[name="int_status_text"]').html(tileList[i]["integration_text"]);

            $('#notifications').append(_t);
        }
    }

    return {
        render: render,
        Tile: Tile
    };
}();
