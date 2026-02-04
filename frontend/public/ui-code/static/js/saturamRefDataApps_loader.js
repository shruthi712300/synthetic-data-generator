$(document).ready(function () {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let app_type = sPageURL.split('=')[1];
    let buffer = "";

    if (app_type == "DA_DACLP") {
        buffer = '<div id="step_src" class="mt-step-col first active"> \
                               <a href="javascript:source()"> \
                            <div class="mt-step-number">1</div> \
                            <div class="mt-step-title">Choose your Sources</div> \
                        </a> \
                    </div> \
                    <div id="step_dest" class="mt-step-col"> \
                    <a href="javascript:destination()"> \
                            <div class="mt-step-number">2</div> \
                            <div class="mt-step-title">Choose your Destination</div> \
                        </a> \
                    </div> \
                    <div id="step_labs" class="mt-step-col"> \
                        <a href="javascript:datalabs();"> \
                            <div class="mt-step-number">3</div> \
                            <div class="mt-step-title">Data Labs</div> \
                        </a> \
                    </div> \
                    <div id="step_conf" class="mt-step-col last"> \
                        <a href="javascript:configure();"> \
                            <div class="mt-step-number">4</div> \
                            <div class="mt-step-title">Configure App</div> \
                        </a> \
                    </div>';
        $("#parent_div_id").append(buffer);
    }
    else {
        buffer = '<div id="step_src" class="mt-step-col first active"> \
                        <a href="javascript:source()"> \
                            <div class="mt-step-number">1</div> \
                            <div class="mt-step-title">Choose your Sources</div> \
                        </a> \
                    </div> \
                    <div id="step_dest" class="mt-step-col"> \
                        <a href="javascript:destination()"> \
                            <div class="mt-step-number">2</div> \
                            <div class="mt-step-title">Choose your Destination</div> \
                        </a> \
                    </div> \
                     <div id="step_conf" class="mt-step-col last"> \
                        <a href="javascript:configure();"> \
                            <div class="mt-step-number">3</div> \
                            <div class="mt-step-title">Configure App</div> \
                        </a> \
                    </div>';
        $("#parent_div_id").append(buffer);
    }
    saturamPiperrApp.init("source");
});

function source() {
    saturamPiperrApp.init("source");
}

function destination() {
    saturamPiperrApp.init("destination");
}

function datalabs() {
    saturamPiperrApp.init("datalabs");
}

function configure() {
    saturamPiperrApp.init("app");
}

function saveIntegration() {
    saturamPiperrApp.init("save_source");
}

/* ---------  FUNCTIONS REF_DATAAPPS_DATALABS  --------- */

$(document).ready(function () {
 let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let app_type = sPageURL.split('=')[1];
    $.getJSON(window.location.protocol + '//'  + window.location.host + "/get_input_table_data?app_type=" + app_type, function (json) {
        console.log(json);
        create_table_from_json(json, "#input_table");
    });
});

function create_table_from_json(json, table_div) {
    let j;
    if ($.fn.DataTable.isDataTable(table_div)) {
        $(table_div).DataTable().destroy();
        $(table_div).empty();
    }
    let table_data = [];
    let column_names = json.columns;
    let col_names_list = [];

    for (j = 0; j < column_names.length; j++) {
        col_names_list.push({title: column_names[j]});
    }

    for (j = 0; j < json.data.length; j++) {
        let local_data = [];
        for (let i = 0; i < column_names.length; i++) {
            local_data.push(json.data[j][column_names[i]]);
        }
        table_data.push(local_data);
    }
    if (table_data.length > 0){
            $(table_div).DataTable({
            data: table_data,
            searching: false,
            scrollY: '50vh',
            scrollCollapse: true,
            columns: col_names_list,
        });
    }

}

$(document).on('click', '.jstree-anchor', function() {
let col_value_list = $('.inlinepopup').find('div[name="data-treeview"]').jstree("get_selected");
    if(col_value_list.length > 0 )
    {
    $('button[name=save_integration]').prop("disabled", false);
    }else{
    $('button[name=save_integration]').prop("disabled", true);
    }
});

function apply_rules() {
    let priority = 0;
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let app_type = sPageURL.split('=')[1];
    let rules_list = JSON.stringify(saturamPiperrApp.get_rules_configuration_datalabs(priority));

    var heads = [];
    $('#result_table').find("thead").find("th").each(function () {
      heads.push($(this).text().trim());
    });
    console.log(heads);
    var rows = [];
    if (heads.length > 0){
    t = $('#result_table').DataTable();
    let table_data = t.data();
    for(j = 0; j < table_data.length; j++){
        let row_data_list = table_data[j];
        let row_data = {}
        for(i = 0; i < heads.length; i++){
            row_data[heads[i]] = row_data_list[i];
            }
         rows.push(row_data);
        }
    }
    console.log(rows);
    let api_data = { 'app_type': app_type,
                     'rules': rules_list,
                     'data': rows,
                     'columns': heads
            }
     $.ajax({
        url: window.location.protocol + '//'  + window.location.host + "/apply_rules",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(api_data),
        success: function (response) {
        console.log(response);
        $('#result_table_div').hide();
        $("#result_table_div").fadeToggle('fast');
        $('#result_table_div').show();
        create_table_from_json(response, "#result_table");
        },
        error: function (response) {
        $('#result_table_div').show();
        $('#result_table_div').hide();
        $("#result_table_div").fadeToggle('fast');
        $('#result_table_div').show();
        create_table_from_json(rows, "#result_table");
        }
    });
}

function get_attr1(val) {
    let dummy_data = {data: [], columns: []};
    let data = saturamPiperrApp.get_databals_table_configuration(dummy_data.data, dummy_data.columns);
    let this_elem = $(val).closest(".row");

    $(this_elem).find('.dropdown-toggle').html('Attribute <span class="caret"></span>');
    if (data.attr.length != 0) {
        select2.render(this_elem, data.attr);
    }
}

function getval1(sel) {
    let param;
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let app_id_key = sPageURL.split('&')[0];
    let app_type =app_id_key.split('=')[1];
    console.log("IN VAL");
    console.log(app_type);

    if (app_type == "DA_DAANO") {
        param = $(sel).find('option:selected').text();
        if (param == "generalize") {
            $(sel).closest('#datalabs_rules').find('#catdiv').show();
        }
        else {
            $(sel).closest('#datalabs_rules').find('#catdiv').hide();
        }
    }
    else {
        let param_list = sel.value.split('$$$');
        param = param_list[0];
        let tooltip_text = param_list[1];
        $(sel).closest('#datalabs_rules').find('#rule_desc').attr('title', tooltip_text);
        $(sel).closest('#datalabs_rules').find('#params').empty();
        if (param != "null" && param != "") {
            param_list = param.split(',');
            if (param_list != "null" && param_list != '') {
                let rule_prototype = $(sel).find('option:selected').attr("name");
                let buffer = '<div class="form-group col-md-12 col-sm-12"><label class="control-label"><strong>' + rule_prototype + '</strong></label></div>';

                $.each(param_list, function (index, value) {
                    console.log("VALUESSS",value)
                    buffer += '<div class="form-group col-md-3 col-sm-3"><label class="control-label">' + value + '</label> \
                         <div class="input-icon"><i class="fa fa-sitemap font-green"></i> \
                         <input type="text" id="' + value + '" value="" class="form-control" placeholder="Enter ' + value + '"> \
                         </div></div>';
                });
                $(sel).closest('#datalabs_rules').find('#params').html(buffer);
            }
        }
    }
}

/* --------- END FUNCTIONS REF_DATAAPPS_DATALABS  --------- */


/* ---------  FUNCTIONS REF_DATAAPPS_DEST  --------- */

function function_all(sel) {
    let text = $(sel).text();
    if (text == "Select All") {
        saturamPiperrApp.select_all_destination();
        $(sel).text("Remove All");
    }
    else if (text == "Remove All") {
        saturamPiperrApp.remove_all_destination();
        $(sel).text("Select All");
    }
}

/* --------- END FUNCTIONS REF_DATAAPPS_DEST  --------- */