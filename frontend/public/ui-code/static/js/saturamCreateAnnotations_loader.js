function get_entity(val) {
    let this_elem = $(val).closest(".row");
    $(this_elem).find('.dropdown-toggle').html('Entity <span class="caret"></span>');
}

function get_attr(val) {
    let this_elem = $(val).closest(".row");
    $(this_elem).find('.dropdown-toggle').html('Attribute <span class="caret"></span>');
}

function get_annot(val) {
    let this_elem = $(val).closest(".row");
    $(this_elem).find('.dropdown-toggle').html('Annotations <span class="caret"></span>');
}

function getSearchData() {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let p_id_key = sPageURL.split('&')[0];
    let p_id = p_id_key.split('=')[1];

    let scope = $('div[name="scope"]').html();
    scope = scope.split(" ", 1);
    let keyword = $('#search_value').val();

    $.getJSON(window.location.protocol + '//' + window.location.host + "/search_annotations?client_id=" + localStorage.getItem("client_id") + "&pipeline_id=" + p_id + "&scope=" + scope + "&keyword=" + keyword, function (json) {
        let result_list = json.data;

        let buffer_tr = "";
        for (let i = 0; i < result_list.length; i++) {
            let buffer_td = "";

            if (result_list[i]["scope"] == "entity") {
                buffer_td += '<td><i class="fa fa-credit-card" aria-hidden="true"></i></td>';
            }
            else if (result_list[i]["scope"] == "attribute") {
                buffer_td += '<td><i class="fa fa-navicon" aria-hidden="true"></i></td>';
            }

            if (result_list[i]["parent"] == null) {
                result_list[i]["parent"] = "";
            }
            buffer_td += '<td>' + result_list[i]["parent"] + '</td>';
            buffer_td += '<td>' + result_list[i]["meta_name"] + '</td>';

            buffer_td += '<td><select multiple id="' + result_list[i]["meta_id"] + '" class="dt-select2" style="width:80%;">';
            let annotations_list = result_list[i]["annotations"];
            for (let j = 0; j < annotations_list.length; j++) {
                if (annotations_list[j]["selected"] == "true") {
                    buffer_td += '<option selected value="' + annotations_list[j]["annotation_id"] + '">' + annotations_list[j]["annotation_name"] + '</option>';
                }
                else {
                    buffer_td += '<option value="' + annotations_list[j]["annotation_id"] + '">' + annotations_list[j]["annotation_name"] + '</option>';
                }
            }

            buffer_td += '</select></td>';
            buffer_td += '<td style="display:none;">' + result_list[i]["meta_id"] + '</td>';

            buffer_tr += '<tr>'.concat(buffer_td).concat('</tr>');
        }
        $('#table_rows').html(buffer_tr);
        $('.dt-select2').select2({
            tags: true
        });

        $('#example').show();
        $('#example').DataTable({
            searching: false,
            scrollY: '50vh',
            scrollCollapse: true,
            "columns": [
                {"width": "5%"},
                {"width": "14%"},
                {"width": "25%"},
                {"width": "55%"},
                {"width": "1%"}
            ]
        })
    });
}

function save_annotations() {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let p_id_key = sPageURL.split('&')[0];
    let p_id = p_id_key.split('=')[1];

    let table = $('#example').DataTable();

    let data = table.rows().data();
    let final_data = [];
    data.each(function (value, index) {
        let value_split = String(value).split(',');
        let id = value_split[value_split.length - 1];
        let select_id = ('#').concat(id);
        let annotation_list = $(select_id).select2('data');

        let annot_list = [];
        for (let i = 0; i < annotation_list.length; i++) {
            let annot_id = annotation_list[i]["id"];
            let annot_text = annotation_list[i]["text"];
            annot_list.push({annotation_id: annot_id, annotation_text: annot_text});
        }
        final_data.push({meta_id: id, annotations: annot_list});

    });

    let data_as_string = JSON.stringify(final_data);
    $.ajax({
        url: window.location.protocol + '//' + window.location.host + "/update_annotations",
        type: 'post',
        data: data_as_string,
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            if (response["status"] === "200" || response["status"] === "SUCCESS:200") {
                window.open("createannotations?p_id=" + p_id, "_self");
            }
        }
    });

}
