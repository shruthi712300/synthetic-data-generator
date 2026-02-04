$(document).ready(function () {
    let DATA_APPS_DATA;

    let renderDataApps = function (data, category) {
        let categoryData = data.filter(item => item.groups == category);
        let tileList = [];
        $(categoryData).each(function (i, item) {
            let t = new saturamAppView.Tile(item.app_id, item.app_name, item.app_display_name, item.app_display_image,item.app_type);
            tileList.push(t);
        });
        saturamAppView.render(tileList);
    };

    let getDataAndRenderDataApps = function (category) {
        if (DATA_APPS_DATA == undefined) {
            $.getJSON(window.location.protocol + '//' + window.location.host + "/apps?app_type=Data App&group=" + category, function (json) {
                DATA_APPS_DATA = json.data;
                renderDataApps(DATA_APPS_DATA, category);
            });
        }
        else {
            renderDataApps(DATA_APPS_DATA, category);
        }
    };

    $('#app-category').click(function (e) {
        let children = $('#app-category').children();
        children.map(function (item) {
            if ($(children[item]).hasClass("active")) {
                $(children[item]).removeClass("active");
            }
        });
        $(e.target).parent().addClass("active");
        getDataAndRenderDataApps($(e.target).parent().attr('id'));
    });

    getDataAndRenderDataApps("consolidation");
});

