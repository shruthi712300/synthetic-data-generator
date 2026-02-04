saturamPiperrApp = function () {

    let pageTypes = {
        "source": ["get_source_configuration", "save_source_configuration", "render_source"],
        "destination": ["render_destination"],
        "app": ["save_app_configuration", "render_app"],
        "datalabs": ["render_datalabs"]
    };

    let global_source_list = [];
    let global_destination_list = [];
    let global_tables_list = [];
    let global_attribute_list = [];
    let global_table_attr_list = [];
    let global_jstree_rule_list = [];
    let global_dist_attribute_list = [];
    let editor_obj_list = [];
    let global_editor_obj_list = [];
    let global_rules_counter_flag = 0;
    let rules_counter_flag_for_page_level = 0;
    let global_source_list_lookup = [];
    let global_refresh_type_list =[];
    let global_schedule_interval_list = [];
    let refresh_type_list=[];
    let global_recon_configuration = [];

    let global_refresh_types = {};
    let global_refresh_schedules = {};
    let global_refresh_schedules_list = [];
    let global_app_type = "";
    let global_p_id = "";
    let global_mode = "";
    let datalabs_data = "";
    let global_table_list = [];

    let sources_list = {"DA_ENTRE": {"brandcard-container_er1": [], "brandcard-container_er2": []}};
    let global_consistency_selected = {"brandcard-container_1":[],"brandcard-container_2":[], "brandcard-container": [],
                                    "brandcard-container_er1": [], "brandcard-container_er2": []};

    var schema_list = [];
    var table_list =[]
                                    
    function init(pageToRender) {
        let sPageURL = decodeURIComponent(window.location.search.substring(1));
        let app_id_key = sPageURL.split('&')[0];

        global_app_type = app_id_key.split('=')[1];

        if (sPageURL.split('&')[1]) {
            let p_id_key = sPageURL.split('&')[1];
            global_p_id = p_id_key.split('=')[1];
            global_mode = "reconfigure_pipeline";
        }
        else {
            global_p_id = "";
            global_mode = "create_pipeline";
        }

        let methodToCall;
        if (pageToRender == "source") {
            methodToCall = pageTypes[pageToRender][2];
        }
        else if (pageToRender == "destination") {
            methodToCall = pageTypes[pageToRender][0];
        }
        else if (pageToRender == "datalabs") {
            methodToCall = pageTypes[pageToRender][0];
        }
        else if (pageToRender == "save_source") {
            methodToCall = pageTypes["source"][1];
        }
        else if (pageToRender == "app") {
            methodToCall = pageTypes[pageToRender][1];
        }
        else if (pageToRender == "get_source_configuration") {
            methodToCall = pageTypes["source"][0];
        }
        else if (pageToRender == "save_app_configuration") {
            methodToCall = pageTypes["app"][0];
        }

        if (methodToCall == "get_source_configuration") {
            return eval(methodToCall + "()");
        }
        else {
            eval(methodToCall + "()");
        }
    }

    function getAppName(app_type) {
        $.getJSON(window.location.protocol + '//' + window.location.host + "/appname?app_type=" + app_type, function (json) {
            let l = json.data;
            $('#app_title').html(l[0]["app_name"]);
        });
    }

    function select_all_source() {
        global_source_list = [];
        global_dist_attribute_list = [];
        global_tables_list = [];
        global_attribute_list = [];
        global_table_attr_list = [];
        global_jstree_rule_list = [];
        $('#div_source').find(".brand-db-card").each(function (index) {
            $(this).find('div[name="tick"]').addClass("has-selection-tick");
        });
        $('#div_source').find(".brand-db-card").each(function (index) {
            getMetaDataStructure(this, "true");
        });

    }

    function save_all_source() {
        $('#div_source').find(".brand-db-card").each(function (index) {
            select_all_save_source(this);
        });
    }

    function remove_all_source() {
        $('#div_source').find(".brand-db-card").each(function (index) {
            $('#div_source').find(".brand-db-card").find('div[name="tick"]').removeClass("has-selection-tick");
            $(this).find('div[name="data-treeview"]').jstree("destroy").empty();
            let buffer = '<ul class="mt-checkbox-list" id="mt-checkbox-list"></ul>';
            $(this).find('div[name="data-treeview"]').html(buffer);
            $(this).find('div[name="data-treeview-1"]').jstree("destroy").empty();
            buffer = '<ul class="mt-checkbox-list-1" id="mt-checkbox-list-1"></ul>';
            $(this).find('div[name="data-treeview-1"]').html(buffer);
        });

        global_source_list = [];
        global_dist_attribute_list = [];
        global_tables_list = [];
        global_attribute_list = [];
        global_table_attr_list = [];
        global_jstree_rule_list = [];
    }

    function generateTileListSource(json) {
        let l = json.data;
        let tileList = [];

        $(l).each(function (i, item) {
            let t = new saturamTileView.Tile(item.integration_type, item.integration_name, "", "appsource", item.integration_id, item.is_selected);
            tileList.push(t);
        });
        saturamTileView.render(tileList);

        let int_id_list = [];
        if (global_source_list.length != 0) {
            for (let i = 0; i < global_source_list.length; i++) {
                int_id_list.push(global_source_list[i].int_id);
            }
            $('#div_source').find(".brand-db-card").each(function (index) {
                if (jQuery.inArray($(this).find('input[name="integration_id"]').val(), int_id_list) !== -1) {
                    $(this).find('div[name="tick"]').addClass("has-selection-tick");
                }
            });
        }

        $("#brandcard-container").inlinePopup({
            itemSelector: ".brand-db-card"
        })
    }
    function generateTileListSourceDiv(json, divId) {
    var l = json.data;
    var tileList=[];
    $(l).each(function(i, item){
        var t = new saturamTileViewDivGeneric.Tile(item.integration_type,item.integration_name,"","appsource",item.integration_id,item.is_selected);
            tileList.push(t);
    });
    saturamTileViewDivGeneric.render(tileList,divId);
    var int_id_list = [];
    if(global_source_list.length != 0){
        for(var i=0; i<global_source_list.length; i++){
            int_id_list.push(global_source_list[i].int_id);
        }
       
        active_div = "";
        inactive_div = "";
        for (key in sources_list[global_app_type]){
            if (divId == "#"+key) {
                active_div = key;
            }
            else{
                inactive_div = key;
            }

        }
        $('#div_source').find( ".brand-db-card" ).each(function( index ) {
            if(jQuery.inArray($(this).find('input[name="integration_id"]').val(), int_id_list) !== -1){
                if (jQuery.inArray($(this).find('input[name="integration_id"]').val(), sources_list[global_app_type][active_div]) !== -1){
                $(divId).find($(this)).find('#tick').addClass("has-selection-tick");
                }
                if (jQuery.inArray($(this).find('input[name="integration_id"]').val(), sources_list[global_app_type][inactive_div]) !== -1){
                $(divId).find($(this)).find('div[name="tick"]').removeClass("has-selection-tick");
                }
            }
        });

    }

    $(divId).inlinePopup({
        itemSelector: ".brand-db-card"
    })

}

    function render_source() {
        $('#div_source').find('#selectall-brand-card').hide();

        if (global_app_type == "DA_DACLP") {
            $('#step_src').attr('class', "mt-step-col first active");
            $('#step_dest').attr('class', "mt-step-col");
            $('#step_labs').attr('class', "mt-step-col");
            $('#step_conf').attr('class', "mt-step-col last");
        }
        else {
            $('#step_src').attr('class', "mt-step-col first active");
            $('#step_dest').attr('class', "mt-step-col");
            $('#step_conf').attr('class', "mt-step-col last");
        }

        if (global_app_type == "DA_ENTRE") {
        $('#step_src').attr('class',"mt-step-col first active");
        $('#step_dest').attr('class',"mt-step-col");
        $('#step_conf').attr('class',"mt-step-col last");
        getAppName(global_app_type);
        $('#div_source').show();
        $('#er_portlet').show();
        $('#portlet_er_tab1_click2').trigger("click");

        if(global_mode == "reconfigure_pipeline"){
         $.getJSON(window.location.protocol + '//' + window.location.host + "/list_integrations?client_id=" + localStorage.getItem("client_id") + "&pipeline_id="+global_p_id, function( json ) {
                generateTileListSourceDiv(json,'#brandcard-container_er1');
         });
        }
        else
        {
            $.getJSON(window.location.protocol + '//' + window.location.host + "/list_integrations?client_id=" + localStorage.getItem("client_id") + "&app_type=" + global_app_type, function ( json ) {
               
                generateTileListSourceDiv(json,'#brandcard-container_er2');
                $('#portlet_er_tab1_click1').trigger("click");
                generateTileListSourceDiv(json,'#brandcard-container_er1');
            });
        }
        let div_name = getConfigureDiv();
        $('#div_destination').hide();
        $(div_name).hide();
        $('#selectall-brand-card').hide();
        $('#general_tile').hide();
        return;
    }

        getAppName(global_app_type);

        if (global_mode == "reconfigure_pipeline") {
            $.getJSON(window.location.protocol + '//' + window.location.host + "/list_integrations?client_id=" + localStorage.getItem("client_id") + "&pipeline_id=" + global_p_id, function (json) {
                generateTileListSource(json);
            });
        }
        else {
            $.getJSON(window.location.protocol + '//' + window.location.host + "/list_integrations?client_id=" + localStorage.getItem("client_id") + "&app_type=" + global_app_type, function (json) {
                generateTileListSource(json);
            });
        }

        let div_name = getConfigureDiv();
        if (global_app_type == "DA_DACLP") {
            $('#div_source').show();
            $('#div_destination').hide();
            $('#div_datalabs').hide();
            $(div_name).hide();
        }
        else {
            $('#div_source').show();
            $('#div_destination').hide();
            $(div_name).hide();
        }

    }

    function select_all_destination() {
        global_destination_list = [];
        $('#div_destination').find(".brand-db-card").each(function (index) {
            $(this).find('div[name="tick"]').addClass("has-selection-tick");
            global_destination_list.push($(this).find('input[name="destination_id"]').val());
        });

    }

    function remove_all_destination() {
        $('#div_destination').find(".brand-db-card").each(function (index) {
            $('#div_destination').find(".brand-db-card").find('div[name="tick"]').removeClass("has-selection-tick");
        });
        global_destination_list = [];
    }

    function generateTileListDestination(json) {
        let l = json.data;
        let tileList = [];
        let dest_tag = "";
        dest_tag = "appdestination";

        $(l).each(function (i, item) {
            let t = new saturamTileView.Tile(item.destination_type, item.destination_name, "", dest_tag, item.destination_id, item.is_selected);
            tileList.push(t);
        });
        saturamTileView.render(tileList);

        if (global_app_type == "DA_DAMSK" || global_app_type == "DA_DARPL" || global_app_type == "DA_ENTTR" || global_app_type == "DA_SYNDA" || global_app_type == "DA_COSIS") {
            $('#div_destination').find(".brand-db-card").each(function (index) {
                if (jQuery.inArray($(this).find('input[name="destination_id"]').val(), global_destination_list) !== -1) {
                    $(this).find('div[name="tick"]').addClass("has-selection-tick");
                }
            });


            $('#div_destination').find('.brandcard-toggle .brand-db-card').click(function () {
                $(this).find('div[name="tick"]').addClass("has-selection-tick");
                global_destination_list.push($(this).find('input[name="destination_id"]').val());
            });
        }
        else {
            if (global_destination_list.length != 0) {
                $('#div_destination').find('.brand-db-card').find('div[name="tick"]').removeClass("has-selection-tick");
                $('#div_destination').find(".brand-db-card").each(function (index) {
                    if ($(this).find('input[name="destination_id"]').val() == global_destination_list[0]) {
                        $(this).find('div[name="tick"]').addClass("has-selection-tick");
                    }
                });
            }

            $('#div_destination').find(".brand-db-card").each(function (index) {
                if ($(this).find('div[name="tick"]').hasClass("has-selection-tick")) {
                    global_destination_list = [];
                    global_destination_list.push($(this).find('input[name="destination_id"]').val());
                }
            });


            $('#div_destination').find('.brandcard-toggle .brand-db-card').click(function () {
                if ($('#div_destination').find('.brand-db-card').find('div[name="tick"]').hasClass('has-selection-tick')) {
                    $('#div_destination').find('.brand-db-card').find('div[name="tick"]').removeClass("has-selection-tick");
                    $(this).find('div[name="tick"]').addClass("has-selection-tick");
                    saturamPiperrApp.init("app");
                }
                else {
                    $(this).find('div[name="tick"]').addClass("has-selection-tick");
                    saturamPiperrApp.init("app");
                }
                global_destination_list = [];
                global_destination_list.push($(this).find('input[name="destination_id"]').val());
            });
        }
    }

    function render_destination() {
        $('#div_destination').find('#selectall-brand-card').hide();
        if (global_app_type == "DA_DAMSK" || global_app_type == "DA_DARPL" || global_app_type == "DA_ENTTR" || global_app_type == "DA_SYNDA" || global_app_type == "DA_COSIS")
        {
            $('#div_destination').find('#selectall-brand-card').show();
        }
        if (global_app_type == "DA_DACLP") {
            $('#step_src').attr('class', "mt-step-col first --is-done");
            $('#step_dest').attr('class', "mt-step-col active");
            $('#step_labs').attr('class', "mt-step-col");
            $('#step_conf').attr('class', "mt-step-col last");
        }
        else {
            $('#step_src').attr('class', "mt-step-col first --is-done");
            $('#step_dest').attr('class', "mt-step-col active");
            $('#step_conf').attr('class', "mt-step-col last");
        }
        if (global_mode == "reconfigure_pipeline") {
            $.getJSON(window.location.protocol + '//' + window.location.host + "/list_destinations?client_id=" + localStorage.getItem("client_id") + "&pipeline_id=" + global_p_id, function (json) {
                generateTileListDestination(json);
            });
        }
        else {
            $.getJSON(window.location.protocol + '//' + window.location.host + "/list_destinations?client_id=" + localStorage.getItem("client_id") + "&app_type=" + global_app_type, function (json) {
                generateTileListDestination(json);
            });
        }


        let div_name = getConfigureDiv();

        $('#div_destination').show();
        $('#div_source').hide();
        $(div_name).hide();
        if (global_app_type == "DA_DACLP") {
            $('#div_datalabs').hide();
        }
    }

    function render_datalabs() {
        if (global_app_type == "DA_DACLP") {
            $('#step_src').attr('class', "col-md-3 col-sm-3 col-xs-3 mt-step-col first");
            $('#step_dest').attr('class', "col-md-3 col-sm-3 col-xs-3 mt-step-col");
            $('#step_labs').attr('class', "col-md-3 col-sm-3 col-xs-3 mt-step-col active");
            $('#step_conf').attr('class', "col-md-3 col-sm-3 col-xs-3 mt-step-col last");
        }
        else {
            $('#step_src').attr('class', "col-md-4 col-sm-4 col-xs-4 mt-step-col first");
            $('#step_dest').attr('class', "col-md-4 col-sm-4 col-xs-4 mt-step-col");
            $('#step_conf').attr('class', "col-md-4 col-sm-4 col-xs-4 mt-step-col last");
        }
        $.getJSON(window.location.protocol + '//' + window.location.host + "/get_input_table_data?app_type=" + global_app_type, function (json) {

            create_table_from_json(json, "#input_table");
            $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?app_type=" + global_app_type, function (rules_json) {
                getRules_1(rules_json, "create");
                $(div_name).find('div#datalabs_rules:last').find("#select2-button-addons-single-input-group-datalabs").empty();
                let data = get_databals_table_configuration(json.data, json.columns);

                $(div_name).find('div#datalabs_rules:last').find("#select2-button-addons-single-input-group-datalabs").select2({
                    data: data.attr
                })
            });
        });


        let div_name = getConfigureDiv();

        $('#div_destination').hide();
        $('#div_source').hide();
        $(div_name).hide();
        if (global_app_type == "DA_DACLP") {
            $('#div_datalabs').show();
        }
    }

    function save_source_configuration() {
        // let int_id = $('div[class="brand-card brand-db-card"]').find('input[name="integration_id"]').val();
        let int_id = $('div.brand-card.brand-db-card.active').find('input[name="integration_id"]').val();
        let int_name = $('div[class="brand-card brand-db-card active"]').find('input[name="integration_name"]').val();
        let int_type = $('div[class="brand-card brand-db-card active"]').find('input[name="integration_type"]').val();
        let col_value = [];
        let selected_col = [];
        let filter_param = "";
        // let parentElement = $('div[class="brand-card brand-db-card active"]')["0"]["parentElement"]["id"];
        let parentElement = $('div.brand-card.brand-db-card.active')[0]?.parentElement?.id;



        let rule_name = '';
        // $(document).ready(function () {
        //     if($('div[name="tick"]').hasClass("has-selection-tick")){
        //         saturamPiperrApp.init("destination");
        //     }
        // });
        $('div[name="data-treeview-1"]').find('a.jstree-anchor').each(function () {
            if (this.parentNode.getAttribute('name') == 'columns') {
                let new_name = $(this).text();
                let col_id = this.parentNode.id;

                let next = $(this).next();
                rule_name = next.text();
                let data = col_id.split('$$');
                let val = col_id.concat('$$').concat(new_name);
                if (rule_name != "" && rule_name != null) {

                    val = val.concat('$$').concat(rule_name);
                }
                col_value.push(val);
                selected_col.push(col_id);
            }
        });
        if(selected_col.length > 0)
        {
                if (global_app_type == "DA_COSIS" || global_app_type == "DA_ENTRE") {
            $(".brand-db-card").each(function (index) {
                if ($(this).find('input[name="integration_id"]').val() == int_id) {
                    $("#" + parentElement).find($(this)).find('div[name="tick"]').addClass("has-selection-tick");
                    sources_list[global_app_type][parentElement].push(int_id);
                }
            });
        }
        else {
            $(".brand-db-card").each(function (index) {
                if ($(this).find('input[name="integration_id"]').val() == int_id) {
                    $(this).find('div[name="tick"]').addClass("has-selection-tick");
                    saturamPiperrApp.init("destination");
                }
            });
        }
        }
        global_source_list = $.grep(global_source_list, function (e) {
            return e.int_id != int_id;
        });
        global_tables_list = $.grep(global_tables_list, function (e) {
            return e.int_id != int_id;
        });
        global_attribute_list = $.grep(global_attribute_list, function (e) {
            return e.int_id != int_id;
        });
        global_table_attr_list = $.grep(global_table_attr_list, function (e) {
            return e.int_id != int_id;
        });
        global_dist_attribute_list = $.grep(global_dist_attribute_list, function (e) {
            return e.int_id != int_id;
        });
        global_jstree_rule_list = $.grep(global_jstree_rule_list, function (e) {
            return e.int_id != int_id;
        });

        if (col_value.length != 0) {
            let search_user = "";
            let search_term = "";
            let others = "";
            if (int_type == "twitter") {
                let search_user = $('.inlinepopup').find('#search_user').val();
                let search_term = $('.inlinepopup').find('#search_term').val();
                if (search_user != "" && search_term != "") {
                    filter_param = search_user.concat(" ").concat(search_term);
                }
                else if (search_user != "" && search_term == "") {
                    filter_param = search_user;
                }
                else if (search_user == "" && search_term != "") {
                    filter_param = search_term;
                }
                else {
                    filter_param = "";
                }
            }
            else if (int_type == "facebook") {
                let search_user = $('.inlinepopup').find('#search_page').val();
                filter_param = search_user;
            }
            else if (int_type == "googletrends") {
                let keywords = $('.inlinepopup').find('#keywords').val();
                let geo = $('.inlinepopup').find('#geo option:selected').val();
                let timeframe = $('.inlinepopup').find('#timeframe option:selected').val();
                let category = $('.inlinepopup').find('#category option:selected').val();

                filter_param = keywords + '$$$' + geo + '$$$' + timeframe + '$$$' + category;
                search_term = keywords;
                others = geo + '$$$' + timeframe + '$$$' + category;
            }
            else {
                filter_param = "";
            }

            let json_data = [];
            let attr_list = [];
            let meta_id_list = [];
            let table_name = "";
            let prev_id = "";
            for (let i = 0; i < col_value.length; i++) {
                let data = col_value[i].split('$$');
                if (data.length == 6) {
                    json_data[i] = {
                        "schema": data[0],
                        "table": data[1],
                        "column": data[4],
                        "metadata_id": data[3],
                        "rule": data[5]
                    };
                    global_jstree_rule_list.push({
                        "int_id": int_id,
                        "column": data[4],
                        "metadata_id": data[3],
                        "rule": data[5]
                    });
                }

                else {
                    json_data[i] = {
                        "schema": data[0],
                        "table": data[1],
                        "column": data[4],
                        "metadata_id": data[3],
                        "rule": ""
                    };
                    global_jstree_rule_list.push({
                        "int_id": int_id,
                        "column": data[4],
                        "metadata_id": data[3],
                        "rule": ""
                    });
                }

                global_dist_attribute_list.push({"int_id": int_id, "col_name": data[4]});


                if (table_name != data[1]) {
                    if (i != "0") {
                        global_attribute_list.push({"text": table_name, "children": attr_list, "int_id": int_id});
                        attr_list = [];
                        global_table_attr_list.push({"id": prev_id, "attr_id": meta_id_list, "int_id": int_id});
                        meta_id_list = [];
                    }
                    global_tables_list.push({"id": i, "text": data[1], "int_id": int_id});
                    table_name = data[1];
                    prev_id = i;
                }
                attr_list.push({"id": data[3], "text": data[4], "int_id": int_id, "title":  data[0]+"_"+data[1]});
                meta_id_list.push(data[3]);
            }

            global_attribute_list.push({"text": table_name, "children": attr_list, "int_id": int_id});
            global_table_attr_list.push({"id": prev_id, "attr_id": meta_id_list, "int_id": int_id});

            let final_data = {
                int_id: int_id,
                int_type: int_type,
                int_name: int_name,
                metadata: json_data,
                selected_col: selected_col,
                filter_param: filter_param,
                search_user: search_user,
                search_term: search_term,
                others: others
            };
            global_source_list.push(final_data);
        }
    }

    function select_all_save_source(thisdiv) {
        let int_id = $(thisdiv).find('input[name="integration_id"]').val();
        let int_name = $(thisdiv).find('input[name="integration_name"]').val();
        let int_type = $(thisdiv).find('input[name="integration_type"]').val();
        let col_value = [];
        let selected_col = [];
        let filter_param = "";

        $(thisdiv).find(".brand-db-card").each(function (index) {
            if ($(this).find('input[name="integration_id"]').val() == int_id) {
                $(this).find('div[name="tick"]').addClass("has-selection-tick");
            }
        });

        let col_value_list = $(thisdiv).find('div[name="data-treeview"]').jstree("get_selected");
        col_value_list.splice(-1, 1);
        col_value_list.splice(-1, 1);
        for (let i = 0; i < col_value_list.length; i++) {
            let data = col_value_list[i].split('$$');
            let col_name = data[2];
            let val = col_value_list[i].concat('$$').concat(col_name);
            col_value.push(val);
            selected_col.push(col_value_list[i]);
        }
        global_source_list = $.grep(global_source_list, function (e) {
            return e.int_id != int_id;
        });
        global_tables_list = $.grep(global_tables_list, function (e) {
            return e.int_id != int_id;
        });
        global_attribute_list = $.grep(global_attribute_list, function (e) {
            return e.int_id != int_id;
        });
        global_table_attr_list = $.grep(global_table_attr_list, function (e) {
            return e.int_id != int_id;
        });
        global_dist_attribute_list = $.grep(global_dist_attribute_list, function (e) {
            return e.int_id != int_id;
        });

        if (col_value.length != 0) {
            let search_user = "";
            let search_term = "";
            let others = "";
            if (int_type == "twitter") {
                let search_user = $(thisdiv).find('#search_user').val();
                let search_term = $(thisdiv).find('#search_term').val();
                if (search_user != "" && search_term != "") {
                    filter_param = search_user.concat(" ").concat(search_term);
                }
                else if (search_user != "" && search_term == "") {
                    filter_param = search_user;
                }
                else if (search_user == "" && search_term != "") {
                    filter_param = search_term;
                }
                else {
                    filter_param = "";
                }
            }
            else if (int_type == "facebook") {
                let search_user = $(thisdiv).find('#search_page').val();
                filter_param = search_user;
            }
            else if (int_type == "googletrends") {
                let keywords = $(thisdiv).find('#keywords').val();
                let geo = $(thisdiv).find('#geo option:selected').val();
                let timeframe = $(thisdiv).find('#timeframe option:selected').val();
                let category = $(thisdiv).find('#category option:selected').val();

                filter_param = keywords + '$$$' + geo + '$$$' + timeframe + '$$$' + category;
                search_term = keywords;
                others = geo + '$$$' + timeframe + '$$$' + category;
            }
            else {
                filter_param = "";
            }

            let json_data = [];
            let attr_list = [];
            let meta_id_list = [];
            let table_name = "";
            let prev_id = "";
            for (let i = 0; i < col_value.length; i++) {
                let data = col_value[i].split('$$');
                json_data[i] = {"schema": data[0], "table": data[1], "column": data[4], "metadata_id": data[3]}

                global_dist_attribute_list.push({"int_id": int_id, "col_name": data[4]});

                if (table_name != data[1]) {
                    if (i != "0") {
                        global_attribute_list.push({"text": table_name, "children": attr_list, "int_id": int_id});
                        attr_list = [];
                        global_table_attr_list.push({"id": prev_id, "attr_id": meta_id_list, "int_id": int_id});
                        meta_id_list = [];
                    }
                    global_tables_list.push({"id": i, "text": data[1], "int_id": int_id});
                    table_name = data[1];
                    prev_id = i;
                }
                attr_list.push({"id": data[3], "text": data[4], "int_id": int_id,  "title":  data[0]+"_"+data[1]});
                meta_id_list.push(data[3]);
            }

            global_attribute_list.push({"text": table_name, "children": attr_list, "int_id": int_id});
            global_table_attr_list.push({"id": prev_id, "attr_id": meta_id_list, "int_id": int_id});

            let final_data = {
                int_id: int_id,
                int_type: int_type,
                int_name: int_name,
                metadata: json_data,
                selected_col: selected_col,
                filter_param: filter_param,
                search_user: search_user,
                search_term: search_term,
                others: others
            };
            global_source_list.push(final_data);
        }

        $(thisdiv).find('div[name="data-treeview-1"]').jstree("destroy").empty();
        const buffer = '<ul class="mt-checkbox-list-1" id="mt-checkbox-list-1"></ul>'
        $(thisdiv).find('div[name="data-treeview-1"]').html(buffer);
    }

    function cronToOptionFormat(schedule_interval) {
        let val;
        if (schedule_interval == "*/30 * * * *") {
            val = "30"
        }
        if (schedule_interval == "*/60 * * * *") {
            val = "60"
        }
        if (schedule_interval == "*/90 * * * *") {
            val = "90"
        }
        if (schedule_interval == "*/120 * * * *") {
            val = "120"
        }
        if (schedule_interval == "@once") {
            val = "once"
        }
        if (schedule_interval == "@daily") {
            val = "daily"
        }
        return val;
    }

    function create_table_from_json(json, table_div) {
        if ($.fn.DataTable.isDataTable(table_div)) {
            $(table_div).DataTable().destroy();
        }
        let table_data1 = [];
        let column_names1 = json.columns;
        let col_names_list1 = [];
        for (let j = 0; j < column_names1.length; j++) {
            col_names_list1.push({title: column_names1[j]});
        }
        for (let j = 0; j < json.data.length; j++) {
            let local_data = [];
            for (let i = 0; i < column_names1.length; i++) {
                local_data.push(json.data[j][column_names1[i]]);
            }
            table_data1.push(local_data);
        }


        $(table_div).DataTable({
            data: table_data1,
            searching: false,
            scrollY: '50vh',
            scrollCollapse: true,
            columns: col_names_list1
        });

    }

    function getRules_1(json,mode){
        var div_name = "#div_datalabs";

        $(div_name).find('div#datalabs_rules:last').find("#select2-button-addons-single-input-group-datalabs").empty();
        var data2 = [];

        $(div_name).find('div#datalabs_rules:last').find("#select2-button-addons-single-input-group-datalabs").select2({
           data: data2
        })
        list_buffer = '<option>Select Rule</option>';
        for(var i=0;i<json.length;i++)
        {
                    var param_1 = json[i].parameter;
                    if(param_1 == null)
                    {
                    param_1 = "";
                    }
                    var param_2 = json[i].rule_desc;
                    var param_3 = param_1+"$$$"+param_2;

            list_buffer+='<option name="'+json[i].rule_prototype+'" value="'+param_3+'" id="'+json[i].rule_id+'">'+json[i].call_identifier+'</option>';

        }
        $(div_name).find('#rule_id').html(list_buffer);
    }


    function getUserRules()
        {

            if ((editor_obj_list.length == 0 && global_editor_obj_list.length == 0) || (editor_obj_list.length != 0 && global_editor_obj_list.length != 0))
            {
            editor_obj_list = $.extend(true, [], global_editor_obj_list);
            var div_name = getConfigureDiv();
          
            $(div_name).find('div#code_editor:last').find(".js-data-example-ajax").empty();
            var data2 = [];

            $(div_name).find('div#code_editor:last').find(".js-data-example-ajax").select2({
               data: data2
            })

            var text_area = $(div_name).find('div#editor_div:last').find('#text_area');
            $(text_area).empty();
            $(text_area).val("def function(input):\n\n\n\n    return input");
           


            var editor = CodeMirror.fromTextArea(text_area[0], {
             mode: {name: "python",
                   version: 2.7,
                   singleLineStringErrors: false},
            lineNumbers: true,
            indentUnit: 4,
            matchBrackets: true,
    //        lineWrapping: true,
            viewportMargin: Infinity,
    //        extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
    //        foldGutter: {
    //            rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.indent, CodeMirror.fold.comment)
    //        },
    //        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
            gutters: ["CodeMirror-linenumbers"],
            extraKeys: { Tab: function(cm) {
                var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                cm.replaceSelection(spaces);
                }
             }
            });
            $(div_name).find('div#editor_div:last').find('#text_area').data('CodeMirrorInstance', editor);
            editor_obj_list.push(editor);
            global_editor_obj_list.push(editor);
           }
           else{
           editor_obj_list = $.extend(true, [], global_editor_obj_list);
       }
    }
    function getRules(json,mode){
        var div_name = getConfigureDiv();

   
        if(mode == "create"){
            if ((rules_counter_flag_for_page_level == 0 && global_rules_counter_flag == 0) || (rules_counter_flag_for_page_level != 0 && global_rules_counter_flag != 0))
            {
                rules_counter_flag_for_page_level = global_rules_counter_flag;
                $(div_name).find('div#rules:last').find(".js-data-example-ajax").empty();
                var data2 = [];

                $(div_name).find('div#rules:last').find(".js-data-example-ajax").select2({
                   data: data2
                })
                if (global_app_type == "DA_DAANO" || global_app_type == "DA_DASTA") {
                    var data = saturamPiperrApp.init("get_source_configuration");

                    $(div_name).find('div#rules:last').find(".js-data-example-ajax").select2({
                       data: data.attr
                    })
               }


                list_buffer = '<option>Select Rule</option>';
                for(var i=0;i<json.length;i++)
                {
                            var param_1 = json[i].parameter;
                            if(param_1 == null)
                            {
                            param_1 = "";
                            }
                            var param_2 = json[i].rule_desc;
                            var param_3 = param_1+"$$$"+param_2;
                    list_buffer+='<option name="'+json[i].rule_prototype+'" value="'+param_3+'" id="'+json[i].rule_id+'">'+json[i].call_identifier+'</option>';
                }
              
                if (rules_counter_flag_for_page_level == 0 && global_rules_counter_flag == 0)
                {
                    $(div_name).find('#rule_id').html(list_buffer);
                }
                else
                {
                    $(div_name).find('div#rules:last').find('#rule_id').html(list_buffer);
                }
                rules_counter_flag_for_page_level = rules_counter_flag_for_page_level + 1;
                global_rules_counter_flag = global_rules_counter_flag + 1;
            }
            else
            {
               rules_counter_flag_for_page_level = global_rules_counter_flag;
            }

        }
        else if(mode == "reconfigure"){
            $(div_name).find('#repeater-1').empty();
            for(var i=0;i<json.length;i++){
                var rules_config = json[i]["rule_txt"];
                var params_html ="";
                $.each( rules_config["params"], function( key, value ) {
                  params_html +='<div class="form-group col-md-3 col-sm-3"><label class="control-label"><strong>'+key+'</strong></label> \
                       <div class="input-icon"><i class="fa fa-sitemap font-green"></i> \
                       <input disabled type="text" id="'+value+'" value="'+value+'" class="form-control"> \
                       </div></div>';
                });
                var cond_html="";
                for(var k=0;k<rules_config["filters"].length;k++){
                    cond_html += '<div id="cond_list"><div class="form-group col-md-6 col-sm-6" id="cond"><label class="control-label"><strong>Select Attribute</strong></label> \
                      <select disabled id="select2-button-addons-single-input-group" class="form-control"> \
                      <option selected>'+rules_config["filters"][k]["column"]+'</option></select></div> \
                      <div class="form-group col-md-3 col-sm-3"><label class="control-label"><strong>Condition</strong></label> \
                      <br/><select disabled name="select-input" class="form-control" id="cond_id"> \
                      <option selected>'+rules_config["filters"][k]["condition"]+'</option></select></div> \
                      <div class="form-group col-md-3 col-sm-3"><label>&nbsp;</label><div class="input-icon"> \
                      <i class="fa fa-sitemap font-green"></i><input type="text" disabled id="cond_val" value="'+rules_config["filters"][k]["value"]+'" class="form-control" > \
                      </div></div></div>';
                }

                var buffer ='<div data-repeater-item class="mt-repeater-item-1"><div class="well well-sm pos-r"><div class="row" id="recon_rules"> \
                          <input type="text" id="ui_rule_id" value="'+json[i]["ui_rule_id"]+'" style="display:none;"/> \
                          <div class="form-group col-md-6 col-sm-6"><label for="select2-button-addons-single-input-group" class="control-label">Select scope</label> \
                          <div class="input-group select2-bootstrap-prepend" id="scope"><div class="input-group-btn" > \
                          <button disabled type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">'+rules_config["scope"]+' \
                          <span class="caret"></span></button><ul class="dropdown-menu"><li><a onclick="get_table(this);">Table</a> \
                          </li><li><a onclick="get_attr(this);">Attribute</a></li></ul></div> \
                          <select disabled multiple id="select2-button-addons-single-input-group" class="form-control js-data-example-ajax"> \
                          </select></div></div> \
                          <div class="form-group col-md-3 col-sm-3"><div class="mt-repeater-input"> \
                          <label class="control-label"><strong>Rule</strong></label><br/> \
                          <select disabled name="select-input" onchange="getval(this);" class="form-control" id="rule_id"> \
                          <option selected id="'+rules_config["rule_id"]+'">'+rules_config["rule_name"]+'</option></select></div></div> \
                          <div class="form-group col-md-3 col-sm-3"><label>&nbsp;</label><div class="input-icon"> \
                          <button disabled type="button" onclick="addcondition(this)" id="addcondition" class="btn green inlinepopupClose">Add Condition</button> \
                          </div></div> \
                          <div class="form-group col-md-12 col-sm-12" id="params">'+params_html+'</div> \
                          <div id ="conditions" class="form-group col-md-12 col-sm-12">'+cond_html+'</div> \
                          </div><a href="javascript:;" data-repeater-delete class="btn btn-sm font-red well-del-btn-pos"> \
                          <i class="fa fa-close"></i> Remove</a></div></div>';
                $(div_name).find('#repeater-1').append(buffer);
                 $(div_name).find(".js-data-example-ajax:last").empty();
                $(div_name).find(".js-data-example-ajax:last").select2({
                      data: rules_config["input_column_names"]
                 })
                $(div_name).find('.js-data-example-ajax:last').val(rules_config["input_column_id"]).trigger('change.select2');
            }
        }

    }


    function getConfiguredSchedule(json, mode, reconfigured_int_ids) {
        let buffer = "";
        //json = json.data;
      
        for (let i = 0; i < json.length; i++) {
            let val = cronToOptionFormat(json[i]["schedule_interval"]);
          
            if (mode == "1" && jQuery.inArray(json[i]["integration_id"], reconfigured_int_ids) == -1) {
          
                let val1 = json[i]["integration_id"];
//                buffer += '<div class="row" > \
//                <div class="col-md-4 col-sm-4"><br/><br/><label class="control-label"><strong>' + json[i]["integration_name"] + '</strong></label> \
//                <input id="int_id" style="display:none" name="integration_id" value="' + json[i]["integration_id"] + '"> </input> \
//                <input id="filter_param" style="display:none" name="filter_param" > </input> \
//                <input id="search_user" style="display:none" name="search_user" > </input> \
//                <input id="search_term" style="display:none" name="search_term" > </input> \
//                <input id="others" style="display:none" name="others" > </input> \
//                <input id="metadata" style="display:none" name="metadata_list" > </input> \
//                </div><div class="col-md-4 col-sm-4"><label class="control-label"><strong>Refresh Type</strong></label> \
//                <br/><select class="form-control" id="refresh_type-' + val1 + '" id="refresh_interval" onchange="get_selected_type(this);"> \
//                <option selected value="' + json[i]["p_refresh_type"] + '">' + json[i]["p_refresh_type"] + '</option> \
//                </select></div><div class="col-md-4 col-sm-4"><label class="control-label"><strong>Schedule Interval (in mins)</strong></label> \
//                <br/><select class="form-control" name="schedule_interval-' + val1 + '" id="schedule_interval" onchange="get_selected_schedule(this);"> \
//                <option selected value="' + json[i]["schedule_interval"] + '">' + json[i]["schedule_interval"] + '</option></select></div></div>';

                buffer += '<div class="row" id="reconfigured"> \
                <div class="col-md-4 col-sm-4"><br/><br/><label class="control-label"><strong>' + json[i]["integration_name"] + '</strong></label> \
                <input id="int_id" style="display:none" name="integration_id" value="' + json[i]["integration_id"] + '"> </input> \
                <input id="filter_param" style="display:none" name="filter_param" ></input> \
                <input id="search_user" style="display:none" name="search_user" > </input> \
                <input id="search_term" style="display:none" name="search_term" > </input> \
                <input id="others" style="display:none" name="others" value="' + others + '"> </input> \
                <input id="metadata" style="display:none" name="metadata_list"> </input> \
                </div><div class="col-md-4 col-sm-4"><label class="control-label"><strong>Refresh Type</strong></label> \
                <br/><select class="form-control" name="refresh_interval-' + val1 + '" id="refresh_type" onchange="get_selected_type(this);"> \
                <option value="complete">complete</option><option value="incremental">incremental</option> \
                </select></div><div class="col-md-4 col-sm-4"><label class="control-label"><strong>Schedule Interval (in mins)</strong></label> \
                <br/><select class="form-control" name="schedule_interval-' + val1 + '" id="schedule_interval" onchange="get_selected_schedule(this);"> \
                <option value="once">once</option><option value="daily">daily</option><option value="30">30</option> \
                <option value="60">60</option><option value="90">90</option><option value="120">120</option></select></div></div>';

           //$("div.id_100 select").val("val2");
           $('#refresh_type').val(json[i]["p_refresh_type"]);
           $('#schedule_interval').val(json[i]["schedule_interval"]);
            }
            else if (mode == "0") {
                buffer += '<div class="row" > \
                <div class="col-md-4 col-sm-4"><br/><br/><label class="control-label"><strong>' + json[i]["integration_name"] + '</strong></label> \
                <input id="int_id" style="display:none" name="integration_id" value="' + json[i]["integration_id"] + '"> </input> \
                <input id="filter_param" style="display:none" name="filter_param" > </input> \
                <input id="search_user" style="display:none" name="search_user" > </input> \
                <input id="search_term" style="display:none" name="search_term" > </input> \
                <input id="others" style="display:none" name="others" > </input> \
                <input id="metadata" style="display:none" name="metadata_list" > </input> \
                </div><div class="col-md-4 col-sm-4"><label class="control-label"><strong>Refresh Type</strong></label> \
                <br/><select class="form-control" name="refresh_type-' + val1 + '" id="refresh_type" onchange="get_selected_type(this);" disabled="true"> \
                <option selected value="' + json[i]["p_refresh_type"] + '">' + json[i]["p_refresh_type"] + '</option> \
                </select></div><div class="col-md-4 col-sm-4"><label class="control-label"><strong>Schedule Interval (in mins)</strong></label> \
                <br/><select class="form-control" name="schedule_interval-' + val1 + '" id="schedule_interval" onchange="get_selected_schedule(this);" disabled="true"> \
                <option selected value="' + val + '">' + val + '</option></select></div></div>';
            }
        }

        return buffer;
    }

    function getConfigureDiv() {
        if (global_app_type == "AA_CSSEG") {
            return "#div_configure_cust_seg";
        }
        else if (global_app_type == "DA_DASTA") {
            return "#div_configure_data_stand";
        }
        else if (global_app_type == "AA_CULFE") {
            return "#div_configure_cust_lifetime";
        }
        else if (global_app_type == "AA_CHDAA") {
            return "#div_configure_churn";
        }
        else if (global_app_type == "AA_DIRIM") {
            return "#div_configure_drm";
        }
        else if (global_app_type == "DA_ENTRE") {
            return "#div_configure_er";
        }
        else if (global_app_type == "AA_ANDET") {
            return "#div_configure_anamoly";
        }
        else if (global_app_type == "DA_MEREL") {
            return "#div_configure_meta_relations";
        }
        else if (global_app_type == "DA_PRAFF") {
            return '#div_configure_prod_aff';
        }
        else if (global_app_type == "DA_DAANO") {
            return "#div_configure_DA"
        }
        else if (global_app_type == "DA_DACLP") {
            return "#div_configure_cleaning"
        }
        else {
            return "#div_configure";
        }
    }

    function render_app() {

       schema_list =  localStorage.getItem("schema_list").split(",");

       table_list =  localStorage.getItem("table_list").split(",");
        rules_counter_flag_for_page_level = 0;
        if (global_app_type == "DA_DACLP") {
            $('#step_src').attr('class', "mt-step-col first --is-done");
            $('#step_dest').attr('class', "mt-step-col --is-done");
            $('#step_labs').attr('class', "mt-step-col");
            $('#step_conf').attr('class', "mt-step-col last active");
            editor_obj_list = [];
        }
        else {
            $('#step_src').attr('class', "mt-step-col first --is-done");
            $('#step_dest').attr('class', "mt-step-col --is-done");
            $('#step_conf').attr('class', "mt-step-col last active");
        }

        let div_name = getConfigureDiv();

        if ((rules_counter_flag_for_page_level == 0 && global_rules_counter_flag == 0) || (rules_counter_flag_for_page_level != 0 && global_rules_counter_flag != 0)) {
            $(div_name).find('div#rules:last').find(".js-data-example-ajax").empty();
            let data2 = [];

            $(div_name).find('div#rules:last').find(".js-data-example-ajax").select2({
                data: data2
            });
        }

        if (global_source_list.length != 0) {        

            var lookup = {};
            var items = global_source_list[0].metadata;
            var result = [];
            
            for (var item, i = 0; item = items[i++];) {
              var name = item.table;
            
              if (!(name in lookup)) {
                lookup[name] = 1;
                result.push(name);
              }
            }
         
            global_table_list = result;

            let destId = global_destination_list;
            $(div_name).find('#app_type').attr("value", global_app_type);
            $(div_name).find('input[name="destination_id"]').attr("value", destId);

            let data0 = global_source_list;

            let buffer = "";
            let reconfigured_int_ids = [];
            
            for (let i = 0; i < data0.length; i++) {
             
                let val = data0[i]["int_name"];
                let val1 = data0[i]["int_id"];
                reconfigured_int_ids.push(parseInt(val1));
                let filter_param = data0[i]["filter_param"];
                let search_user = data0[i]["search_user"];
                let search_term = data0[i]["search_term"];
                let others = data0[i]["others"];
                let metadata_list = data0[i]["metadata"];
                let int_type = data0[i]["int_type"];
                let meta = [];
               
                for (let j = 0; j < metadata_list.length; j++) {
                    if (metadata_list[j]["metadata_id"] != null) {
                        let dic = metadata_list[j]["metadata_id"].concat(":").concat(metadata_list[j]["column"]);
                        meta.push(dic);                       
                    }
                }

                for(let k=0;k<result.length;k++){
                    let unique = metadata_list.filter(function(obj) {
                        return obj.table == result[k];
                    });
                   var _ref_type=[];
                    for (let j = 0; j < unique.length; j++) {                       
                            let cols = unique[j]["metadata_id"];  
                            _ref_type.push(cols);
                       
                    }
                    let dic1 = {
                        "tableName":result[k],
                        "columnname":_ref_type
                    }
                    refresh_type_list.push(dic1);
    

                }
               
                if (int_type == "twitter" || int_type == "facebook") {
                    buffer += '<div class="row" id="reconfigured"> \
                <div class="col-md-4 col-sm-4"><br/><br/><label class="control-label"><strong>' + val + '</strong></label> \
                <input id="int_id" style="display:none" name="integration_id" value="' + val1 + '"> </input> \
                <input id="filter_param" style="display:none" name="filter_param" value="' + filter_param + '"></input> \
                <input id="search_user" style="display:none" name="search_user" value="' + search_user + '"> </input> \
                <input id="search_term" style="display:none" name="search_term" value="' + search_term + '"> </input> \
                <input id="others" style="display:none" name="others" value="' + others + '"> </input> \
                <input id="metadata" style="display:none" name="metadata_list" value="' + meta + '"> </input> \
                </div><div class="col-md-4 col-sm-4"><label class="control-label"><strong>Refresh Type</strong></label> \
                <br/><select class="form-control" name="refresh_type-' + val1 + '" id="refresh_type" onchange="get_selected_type(this);">\
                <option selected value="incremental">incremental</option> \
                </select></div><div class="col-md-4 col-sm-4"><label class="control-label"><strong>Schedule Interval (in mins)</strong></label> \
                <br/><select class="form-control" name="schedule_interval-' + val1 + '" id="schedule_interval" onchange="get_selected_schedule(this);"> \
                <option value="30">30</option> \
                </select></div></div>';
                }
                else {
                  
                    buffer += '<div class="row" style="margin-bottom:20px;" id="reconfigured"> \
                    <div class="col-md-6"><label class="control-label" style="text-transform: capitalize;"><strong>Source DB: </strong><strong>' + val + '</strong></label></div>\
                    <input id="int_id" style="display:none" name="integration_id" value="' +val1 + '"> </input> \
                    <input id="filter_param" style="display:none" name="filter_param" value="' + filter_param + '"></input> \
                    <input id="search_user" style="display:none" name="search_user" value="' + search_user + '"> </input> \
                    <input id="search_term" style="display:none" name="search_term" value="' + search_term + '"> </input> \
                    <input id="others" style="display:none" name="others" value="' + others + '"> </input> \
                    <input id="metadata" style="display:none" name="metadata_list" value="' + meta + '"> </input></div>';
                    for(var j1=0;j1<schema_list.length;j1++){
                        buffer += '<br/><div class="row form-group">\
                        <div class="col-md-3"><br/><label class="form-label"><strong>Schema: </strong><strong>' + schema_list[j1] + '</strong></label> \
                        </div><div class="col-md-3"><label class="control-label text-light"><span>Schedule Interval (in mins)</span></label> \
                        <br/><select class="form-control" name="schedule_interval-' + schema_list[j1] + '" id="schedule_interval-' + schema_list[j1] + '" onchange="get_selected_schedule(this);"> \
                        <option value="once">once</option><option value="daily">daily</option><option value="hourly">hourly</option><option value="minutes">minutes</option> \
                        <option value="weekly">weekly</option><option value="monthly">monthly</option><option value="custom_schedule">Custom Schedule</option></select> \
                        <div id="custom_schedule_interval" name="custom_schedule_interval-' + schema_list[j1] + '" style="display:none" class="form-inline"><label>Every</label><div class="form-group"><select id="select_custom_time"  name="select_custom_time-' + val1 + '"   onchange="get_selected_time_interval(this);" class="form-control"><option value="minutes">minutes</option><option value="hours" selected >hours</option><option value="days">days</option><option value="months">months</option></select></div><div class="form-group"><select id="select_time_limit"  name="select_time_limit' + val1 + '"  class="form-control"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option></select></div></div></div>\
                        </div>';

                        var filtered_table_list = global_source_list[0].metadata.filter(function(obj){
                            return obj.schema == schema_list[j1] ;
                        })

                        var lookup = {};
                        var items = filtered_table_list;
                        var table_result = [];
                        
                        for (var item, i11 = 0; item = items[i11++];) {
                          var name = item.table;
                        
                          if (!(name in lookup)) {
                            lookup[name] = 1;
                            table_result.push(name);
                          }
                        }
                        
                        for(var rIdx=0;rIdx<table_result.length;rIdx++){
                            var tableName = table_result[rIdx];
                            buffer += '<div class="row" id="reconfigured_table" style="margin-bottom:30px">\
                            <div class="col-md-3"><br/><label class="form-label"><strong>Source Table: </strong><strong>' + tableName + '</strong>\
                            </label></div>\
                             <div class="col-md-3" id="input-container-' + tableName + '"><label class="control-label text-light"><span>Refresh Type</span></label> \
                             <br/><select class="form-control" name="refresh_interval-' + tableName + '" id="refresh_interval-' + tableName + '" onchange="get_selected_type(this);"><option value="complete">complete</option><option value="incremental">incremental</option> \
                             </select></div>\
                            </div>';
                        }
                        // for (var rIdx = 0; rIdx < table_result.length; rIdx++) {
                        //     var tableName = table_result[rIdx];
                        //     buffer += '<div class="row mb-3 align-items-center" id="reconfigured_table" style="margin-bottom:30px">\
                        //         <div class="col-md-3">\
                        //             <label class="form-label mb-0"><strong>Source Table: </strong><strong>' + tableName + '</strong></label>\
                        //         </div>\
                        //         <div class="col-md-3">\
                        //             <label class="control-label text-light"><span>Refresh Type</span></label>\
                        //             <div class="d-flex align-items-center gap-2" id="input-container-' + tableName + '">\
                        //                 <select class="form-control" style="max-width: 200px;;" \
                        //                     name="refresh_interval-' + tableName + '" \
                        //                     id="refresh_interval-' + tableName + '" \
                        //                     onchange="get_selected_type(this);">\
                        //                     <option value="complete">complete</option>\
                        //                     <option value="incremental">incremental</option>\
                        //                 </select>\
                        //                 <!-- Dynamic input will be appended here -->\
                        //             </div>\
                        //         </div>\
                        //     </div>';

                        // }
                        

                    }
                    
                 
              //  }
                   
                    
                }
            }

        
            if (global_mode == "reconfigure_pipeline") {
        

                $(div_name).find('input[name="p_id"]').attr("value", global_p_id);

                let buffer_res;
                $.getJSON(window.location.protocol + '//' + window.location.host + "/get_schedule?pipeline_id=" + global_p_id, function (json) {
                    json = json.data;
                 
                    let local_reconfigured_int_ids = [];
                    for (let i = 0; i < json.length; i++) {
                        let temp_val = json[i]["integration_id"];
                        if (global_source_list_lookup.length == 0 || jQuery.inArray(parseInt(temp_val), global_source_list_lookup) == -1) {
                            local_reconfigured_int_ids.push(temp_val);
                        }
                    }
                    buffer_res = getConfiguredSchedule(json, "1", local_reconfigured_int_ids);
                });

                setTimeout(function () {
                    buffer = buffer + buffer_res;
                    $(div_name).find('#refresh_interval').html(buffer);
                    Object.keys(global_refresh_types).forEach(function (key) {
                        let value;
                        value = global_refresh_types[key];

                        $(div_name).find('#refresh_interval').find('select[name=refresh_interval-' + key + ']').val(value);
                    });
                    Object.keys(global_refresh_schedules).forEach(function (key) {
                        let value;
                        value = global_refresh_schedules[key];
                        $(div_name).find('#refresh_interval').find('select[name=schedule_interval-' + key + ']').val(value);
                    });
                }, 3000);
            }
            else {
                $(div_name).find('#refresh_interval').html(buffer);

                Object.keys(global_refresh_types).forEach(function (key) {
                    let value;
                    value = global_refresh_types[key];

                    $(div_name).find('#refresh_interval').find('select[name=refresh_interval-' + key + ']').val(value);
                });
                Object.keys(global_refresh_schedules).forEach(function (key) {
                    let value;
                    value = global_refresh_schedules[key];
                    $(div_name).find('#refresh_interval').find('select[name=schedule_interval-' + key + ']').val(value);
                });
            }

            global_source_list_lookup = $.extend(true, [], reconfigured_int_ids);
        }
        else {
            if (global_mode == "reconfigure_pipeline") {
                let buffer = "";
                let local_reconfigured_int_ids = [];
                $.getJSON(window.location.protocol + '//' + window.location.host + "/get_schedule?pipeline_id=" + global_p_id, function (json) {
                    json = json.data;
                 
                    for (let i = 0; i < json.length; i++) {
                        let temp_val = json[i]["integration_id"];
                        if (global_source_list_lookup.length == 0 || jQuery.inArray(parseInt(temp_val), global_source_list_lookup) == -1) {
                            global_source_list_lookup.push(temp_val);
                            local_reconfigured_int_ids.push(temp_val);
                        }
                    }
                  
                    buffer = getConfiguredSchedule(json, "1", local_reconfigured_int_ids);
                });
                setTimeout(function () {
                    $(div_name).find('#refresh_interval').html(buffer);
                    Object.keys(global_refresh_types).forEach(function (key) {
                        let value = global_refresh_types[key];
                        $(div_name).find('#refresh_interval').find('select[name=refresh_interval-' + key + ']').val(value);
                    });
                    Object.keys(global_refresh_schedules).forEach(function (key) {
                        let value = global_refresh_schedules[key];
                        $(div_name).find('#refresh_interval').find('select[name=schedule_interval-' + key + ']').val(value);
                    });
                }, 3000);
            }
        }

        if (global_app_type == "AA_CSSEG") {

            if (global_mode == "create_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?app_type=" + global_app_type, function (json) {
                    getRules(json, "create");
                });
            }
            else if (global_mode == "reconfigure_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?pipeline_id=" + global_p_id, function (json) {
                    global_recon_configuration = json;
                    getRules(json, "reconfigure");
                });
            }

            $('#div_configure_cust_seg').show();
        }
        else if (global_app_type == "AA_CULFE") {
            $('#div_configure_cust_lifetime').show();
        }
        else if (global_app_type == "AA_CHDAA") {
            if (global_mode == "create_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?app_type=" + global_app_type, function (json) {
                    getRules(json, "create");
                });
            }
            else if (global_mode == "reconfigure_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?pipeline_id=" + global_p_id, function (json) {
                    global_recon_configuration = json;
                    getRules(json, "reconfigure");
                });
            }

            $('#div_configure_churn').show();
        }
        else if (global_app_type == "DA_DASTA") {
            if (global_mode == "create_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?app_type=" + global_app_type, function (json) {
                    getRules(json, "create");
                });
            }
            else if (global_mode == "reconfigure_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?pipeline_id=" + global_p_id, function (json) {
                    global_recon_configuration = json;
                    getRules(json, "reconfigure");
                });
            }

            $('#div_configure_data_stand').show();
        }
        else if (global_app_type == "AA_DIRIM") {
            $('#div_configure_drm').show();
        }
        else if (global_app_type == "DA_ENTRE") {
            $('#div_configure_er').show();
            let data = global_dist_attribute_list;
            let attr_list = [];
            if (data.length != 0) {
                for (let i = 0; i < data.length; i++) {
                    attr_list.push(data[i]["col_name"]);
                }

                let unique = attr_list.filter(function (itm, i, attr_list) {
                    return i == attr_list.indexOf(itm);
                });
                let list_buffer = '<option value="" selected>--Select Attribute--</option>';
                for (let j = 0; j < unique.length; j++) {
                    list_buffer += '<option value="' + unique[j] + '">' + unique[j] + '</option>';
                }
                $('#div_configure_er').find('#select-attribute').html(list_buffer);
            }
        }
        else if (global_app_type == "AA_ANDET") {
            $('#div_configure_anamoly').show();
        }
        else if (global_app_type == "DA_MEREL") {
            $('#div_configure_meta_relations').show();

            $(div_name).find('div#rules:last').find(".js-data-example-ajax").empty();
            let data2 = [];

            $(div_name).find('div#rules:last').find(".js-data-example-ajax").select2({
                data: data2
            });
        }
        else if (global_app_type == "DA_PRAFF") {
            $('#div_configure_prod_aff').show();
        }
        else if (global_app_type == "DA_DAANO") {
            if (global_mode == "create_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?app_type=" + global_app_type, function (json) {
                    getRules(json, "create");
                });
            }
            else if (global_mode == "reconfigure_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?pipeline_id=" + global_p_id, function (json) {
                    global_recon_configuration = json;
                    getRules(json, "reconfigure");
                });
            }

            $('#div_configure_DA').show();
            $('.alert-success').html('"identifier", "sensitive attribute" and "generalize" are mandatory rules to be set for this app.');
            $('.alert-success').show();
        }
        else if (global_app_type == "DA_DACLP") {
            if (global_mode == "create_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?app_type=" + global_app_type, function (json) {
                    getRules(json, "create");
                    getUserRules();
                });
            }
            else if (global_mode == "reconfigure_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?pipeline_id=" + global_p_id, function (json) {
                    global_recon_configuration = json;
                    getRules(json, "reconfigure");
                    getUserRules();
                });
            }

            $('#div_configure_cleaning').show();
        }
        else {
            if (global_app_type == "DA_DAMSK" || global_app_type == "DA_SYNDA" || global_app_type == "DA_DARPL" || global_app_type == "DA_ENTTR" || global_app_type == "DA_COSIS" || global_app_type == "DA_PIITR") {
                $('#rule_config_div').hide();
                $('#div_configure').show();
            }
            if (global_mode == "create_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?app_type=" + global_app_type, function (json) {
                    getRules(json, "create");
                });
            }
            else if (global_mode == "reconfigure_pipeline") {
                $.getJSON(window.location.protocol + '//' + window.location.host + "/rules?pipeline_id=" + global_p_id, function (json) {
                    global_recon_configuration = json;
                    getRules(json, "reconfigure");
                });
            }
            $('#div_configure').show();
            if (global_app_type != "DA_DAINT")
            {
            $('#rule_config_div').show()
            }
        }


        $('#div_source').hide();
        $('#div_destination').hide();
        if (global_app_type == "DA_DACLP") {
            $('#div_datalabs').hide();
        }
    }

    function get_source_configuration() {
        return {
            "table": global_tables_list,
            "attr": global_attribute_list,
            "src": global_source_list,
            "dist_attr": global_dist_attribute_list
        };
    }

    function get_demo_table_configuration() {
        let local_table_list = [];
        let int_id1 = 1;
        let local_attribute_list = [];
        let attr_list1 = [];
        let meta_id_list1 = [];
        let local_source_list = [];
        let int_type = "postgres";
        let int_name = "Demo Data";
        let local_json_data = [];
        let selected_col = [2, 3, 4, 5, 6, 7];
        let filter_param = "";
        let search_user = "";
        let others = "";
        let local_dist_attribute_list = [];

        local_table_list.push({"id": 1, "text": "Sample Data", "int_id": int_id1});

        attr_list1.push({"id": 2, "text": "SSN", "int_id": 1});
        attr_list1.push({"id": 3, "text": "Name", "int_id": 1});
        attr_list1.push({"id": 4, "text": "Date of Birth", "int_id": 1});
        attr_list1.push({"id": 5, "text": "Address", "int_id": 1});
        attr_list1.push({"id": 6, "text": "Phonenumber", "int_id": 1});
        attr_list1.push({"id": 7, "text": "Gender", "int_id": 1});
        attr_list1.push({"id": 8, "text": "Work class", "int_id": 1});

        meta_id_list1.push(2);
        meta_id_list1.push(3);
        meta_id_list1.push(4);
        meta_id_list1.push(5);
        meta_id_list1.push(6);
        meta_id_list1.push(7);

        local_attribute_list.push({"text": "Sample Data", "children": attr_list1, "int_id": int_id1});

        local_json_data.push({"schema": "demo", "table": "Demo Table", "column": "SSN", "metadata_id": 2});
        local_json_data.push({"schema": "demo", "table": "Demo Table", "column": "Name", "metadata_id": 3});
        local_json_data.push({"schema": "demo", "table": "Demo Table", "column": "Date of Birth", "metadata_id": 4});
        local_json_data.push({"schema": "demo", "table": "Demo Table", "column": "Address", "metadata_id": 5});
        local_json_data.push({"schema": "demo", "table": "Demo Table", "column": "Phonenumber", "metadata_id": 6});
        local_json_data.push({"schema": "demo", "table": "Demo Table", "column": "Gender", "metadata_id": 7});
        local_json_data.push({"schema": "demo", "table": "Demo Table", "column": "Work class", "metadata_id": 8});

        let final_data = {
            int_id: int_id1,
            int_type: int_type,
            int_name: int_name,
            metadata: local_json_data,
            selected_col: selected_col,
            filter_param: filter_param,
            search_user: search_user,
            search_term: search_term,
            others: others
        };
        local_source_list.push(final_data);

        local_dist_attribute_list.push({"int_id": int_id1, "col_name": "SSN"});
        local_dist_attribute_list.push({"int_id": int_id1, "col_name": "Name"});
        local_dist_attribute_list.push({"int_id": int_id1, "col_name": "Date of Birth"});
        local_dist_attribute_list.push({"int_id": int_id1, "col_name": "Address"});
        local_dist_attribute_list.push({"int_id": int_id1, "col_name": "Phonenumber"});
        local_dist_attribute_list.push({"int_id": int_id1, "col_name": "Gender"});
        local_dist_attribute_list.push({"int_id": int_id1, "col_name": "Work class"});

        return {
            "table": local_table_list,
            "attr": local_attribute_list,
            "src": local_source_list,
            "dist_attr": local_dist_attribute_list
        };
    }

    function get_databals_table_configuration(local_data, columns) {
        let local_table_list = [];
        let int_id1 = 1;
        let local_attribute_list = [];
        let attr_list1 = [];
        let meta_id_list1 = [];
        let local_source_list = [];
        let int_type = "postgres";
        let int_name = "Sample Data";
        let local_json_data = [];
        let selected_col = [];
        let filter_param = "";
        let search_user = "";
        let others = "";
        let search_term = "";
        let local_dist_attribute_list = [];

        if (datalabs_data != "") {
            return datalabs_data;
        }

        local_table_list.push({"id": 1, "text": "Sample Data", "int_id": int_id1});

        for (let j = 0; j < columns.length; j++) {
            attr_list1.push({"id": (j + 2), "text": columns[j], "int_id": int_id1});
            meta_id_list1.push((j + 2));
            selected_col.push((j + 2));
            local_json_data.push({
                "schema": "demo",
                "table": "Sample Data",
                "column": columns[j],
                "metadata_id": j + 2
            });
            local_dist_attribute_list.push({"int_id": int_id1, "col_name": columns[j]});
        }

        local_attribute_list.push({"text": "Sample Data", "children": attr_list1, "int_id": int_id1});

        let final_data = {
            int_id: int_id1,
            int_type: int_type,
            int_name: int_name,
            metadata: local_json_data,
            selected_col: selected_col,
            filter_param: filter_param,
            search_user: search_user,
            search_term: search_term,
            others: others
        };
        local_source_list.push(final_data);
        datalabs_data = {
            "table": local_table_list,
            "attr": local_attribute_list,
            "src": local_source_list,
            "dist_attr": local_dist_attribute_list
        };
        return datalabs_data;
    }

    function getCustomCronFormat(count,time)
    {
         let val;
         if(time =="minutes")
            {
            val= "*/"+count+" * * * *"
            }else if(time =="hours")
            {
            val= "0 */"+count+" * * *"
            }else if(time =="days")
            {
            //runs every n days at@12am
            val ="0 0 */"+count+" * *"
            }else if(time == "months")
            {
            //runson day 1 of the month, every n months
            val= "0 0 1 */"+count+" *"
            }
     return val
    }

    function getCronFormat(schedule_interval) {
        let val;
        if (schedule_interval == "30") {
            val = "*/30 * * * *"
        }
        if (schedule_interval == "60") {
            val = "*/60 * * * *"
        }
        if (schedule_interval == "90") {
            val = "*/90 * * * *"
        }
        if (schedule_interval == "120") {
            val = "*/120 * * * *"
        }
        if (schedule_interval == "once") {
            val = "@once"
        }
        if (schedule_interval == "daily") {
            val = "@daily"
        }
        if (schedule_interval == "hourly") {
            val = "@hourly"
        }
        if (schedule_interval == "weekly") {
            val = "@weekly"
        }

        if (schedule_interval == "monthly") {
            val = "@monthly"
        }
        if (schedule_interval == "hourly") {
            val = "@hourly"
        }
        return val;
    }

    function get_refresh_schedule() {
        let data_list = [];
        let div_name = getConfigureDiv();

        $(div_name).find('#refresh_interval #reconfigured').each(function (index) {
            let int_id = $(this).find('input[name="integration_id"]').val();
            let meta_list = $(this).find('#metadata').val();
            let filter_param = $(this).find('#filter_param').val();
            let search_user = $(this).find('#search_user').val();
            let search_term = $(this).find('#search_term').val();
            let others = $(this).find('#others').val();
            let refresh_type = $(this).find("#refresh_type option:selected").val();
            let schedule_interval = $(this).find("#schedule_interval option:selected").val();
            let schedule;
            if (schedule_interval =="custom_schedule")
            {
            count= $(this).find("#custom_schedule_interval").find("#select_time_limit").val();
            time = $(this).find("#custom_schedule_interval").find("#select_custom_time").val();
            schedule=getCustomCronFormat(count, time)
            }
            else
            {
            schedule = getCronFormat(schedule_interval);
            }
           // global_schedule_interval_list=[];
           // let metadata_list = global_source_list[0]["metadata"];
            // for (let j = 0; j < metadata_list.length; j++) {               
            //         let dic = metadata_list[j]["metadata_id"].concat(":").concat(schedule);
            //         global_schedule_interval_list.push(dic); 
            // }

            if(global_schedule_interval_list.length == 0){
              
                saveselected_schedule(document.getElementById("schedule_interval-"+schema_list[0]));
            }
         
            if(global_refresh_type_list.length == 0){
              
                saveselected_type(document.getElementById("refresh_interval-"+global_table_list[0]));
            }

            let final_data = JSON.stringify({
                int_id: int_id,
                filter_param: filter_param,
                search_term: search_term,
                search_user: search_user,
                others: others,
                metadata: meta_list,
                refresh_type:global_refresh_type_list.join(","),
                schedule_interval: global_schedule_interval_list.join(","),
                incremental_column: incrementalColumn
            });
            data_list.push(final_data);
        });
        return data_list;
    }

    function get_rules_configuration(priority) {
        let rules_list = [];
        let div_name = getConfigureDiv();

        $(div_name).find('#repeater-1').find(".mt-repeater-item").each(function (index) {
            let rule = $(this).find("#rule_id option:selected").attr("id");
            let rule_name = $(this).find("#rule_id option:selected").text();
            let scope = $(this).find('.dropdown-toggle').html();
            scope = scope.split(" ", 1);

            let param_dict = {};
            $(this).find('#params input').each(function () {
                let val = this.value;
                let id = this.id;
                param_dict[id] = val;
            });

            let filter_list = [];
            $(this).find('#cond_list').each(function () {
                let column_data = $(this).find('.js-data-example-ajax').select2('data');
                let column = column_data[0]["id"];
                let column_name = column_data[0]["text"];
                let condition = $(this).find("#cond_id option:selected").attr("id");
                let value = $(this).find('#cond_val').val();
                filter_list.push({condition: condition, column_name: column_name, column: column, value: value});
            });

            let col = $(this).find('#scope').find('.js-data-example-ajax').select2('data');
            let col_list = [];
            let col_name_list = [];
            let col_id_list = [];
            if (scope[0] == "Table") {
                for (let i = 0; i < col.length; i++) {
                    col_name_list.push({"id": col[i]["id"], "text": col[i]["text"]});
                    col_id_list.push(col[i]["id"]);
                    let table_id = col[i]["id"];
                    for (let j = 0; j < global_table_attr_list.length; j++) {
                        if (table_id == global_table_attr_list[j]["id"]) {
                            let metalist = global_table_attr_list[j]["attr_id"];
                            for (let k = 0; k < metalist.length; k++) {
                                col_list.push(metalist[k]);
                            }
                        }
                    }
                }
            }
            else if (scope[0] == "Attribute") {
                for (let i = 0; i < col.length; i++) {
                    col_name_list.push({"id": col[i]["id"], "text": col[i]["text"]});
                    col_id_list.push(col[i]["id"]);
                    col_list.push(col[i]["id"]);
                }
            }
            let pri = priority + index;
            let rules_data = {
                scope: scope[0],
                rule_id: rule,
                rule_name: rule_name,
                input_columns: col_list,
                input_column_id: col_id_list,
                input_column_names: col_name_list,
                output_column: "",
                priority: pri,
                filters: filter_list,
                params: param_dict
            };
            if (index == 0 && scope[0] == "") {
                rules_list = [];
            }
            else {
                rules_list.push(rules_data);
            }
        });
        return rules_list;
    }

    function get_user_defined_rules_configuration(priority) {
        let rules_list = [];
        let div_name = getConfigureDiv();
        let global_user_rules_data_list = [];

        let algo_config_list = [];


        $(div_name).find("#repeater-2").find(".mt-repeater-item").each(function (index) {
            let user_rules_data = {};
            let editor = $(this).find('#text_area').data('CodeMirrorInstance');
            let datatype = $(this).find("#data_type option:selected").val();

          


            let user_function = editor.getValue();

            let scope = $(this).find('.dropdown-toggle').html();
            scope = scope.split(" ", 1);
            let col = $(this).find('#scope_code').find('.js-data-example-ajax').select2('data');
            let col_list = [];
            let col_name_list = [];
            let col_id_list = [];


            user_rules_data.text_area = text_area;
            user_rules_data.editor_value = user_function;
            user_rules_data.scope = scope[0];
            user_rules_data.input_column_id = [];
            user_rules_data.input_column_name = [];
            if (scope[0] == "Table") {
                for (let i = 0; i < col.length; i++) {
                    col_name_list.push({"id": col[i]["id"], "text": col[i]["text"]});
                    col_id_list.push(col[i]["id"]);
                    let table_id = col[i]["id"];
                    for (let j = 0; j < global_table_attr_list.length; j++) {
                        if (table_id == global_table_attr_list[j]["id"]) {
                            let meta_list = global_table_attr_list[j]["attr_id"];
                            for (let k = 0; k < meta_list.length; k++) {
                                col_list.push(meta_list[k]);
                            }
                        }
                    }
                }
            }
            else if (scope[0] == "Attribute") {
                for (let i = 0; i < col.length; i++) {
                    col_name_list.push({"id": col[i]["id"], "text": col[i]["text"]});
                    col_id_list.push(col[i]["id"]);
                    col_list.push(col[i]["id"]);
                }
            }
            user_rules_data.input_column_id = col_id_list;
            user_rules_data.input_column_name = col_name_list;
            global_user_rules_data_list.push(user_rules_data);
            pri = priority + index;
            let rules_data = {
                scope: scope[0],
                user_function: user_function,
                input_columns: col_list,
                input_column_id: col_id_list,
                input_column_names: col_name_list,
                output_column: "",
                output_type: datatype,
                priority: pri
            };
            if (index == 0 && scope[0] == "") {
                rules_list = [];
            }
            else {
                rules_list.push(rules_data);
            }
        });
        return rules_list;
    }

    function get_rules_configuration_datalabs(priority) {
        let rules_list = [];
        let div_name = "#div_datalabs";

        $(div_name).find(".mt-repeater-item").each(function (index) {
            let rule = $(this).find("#rule_id option:selected").attr("id");
            let rule_name = $(this).find("#rule_id option:selected").text();
            let scope = $(this).find('.dropdown-toggle').html();
            scope = scope.split(" ", 1);

            let param_dict = {};
            $(this).find('#params input').each(function () {
                let val = this.value;
                let id = this.id;
                param_dict[id] = val;
            });

            let filter_list = [];
            $(this).find('#cond_list').each(function () {
                let column_data = $(this).find('#select2-button-addons-single-input-group-datalabs').select2('data');
                let column = column_data[0]["id"];
                let column_name = column_data[0]["text"];
                let condition = $(this).find("#cond_id option:selected").attr("id");
                let value = $(this).find('#cond_val').val();
                filter_list.push({condition: condition, column_name: column_name, column: column, value: value});
            });

            let col = $(this).find('#scope').find('#select2-button-addons-single-input-group-datalabs').select2('data');
          
            let col_list = [];
            let col_name_list = [];
            let col_id_list = [];
            if (scope[0] == "Table") {
                for (let i = 0; i < col.length; i++) {
                    col_name_list.push({"id": col[i]["id"], "text": col[i]["text"]});
                    col_id_list.push(col[i]["id"]);
                    let table_id = col[i]["id"];
                    for (let j = 0; j < global_table_attr_list.length; j++) {
                        if (table_id == global_table_attr_list[j]["id"]) {
                            let metalist = global_table_attr_list[j]["attr_id"];
                            for (let k = 0; k < metalist.length; k++) {
                                col_list.push(metalist[k]);
                            }
                        }
                    }
                }
            }
            else if (scope[0] == "Attribute") {
                for (let i = 0; i < col.length; i++) {
                    col_name_list.push({"id": col[i]["id"], "text": col[i]["text"]});
                    col_id_list.push(col[i]["id"]);
                    col_list.push(col[i]["id"]);
                }
            }
            let pri = priority + index;
            let rules_data = {
                scope: scope[0],
                rule_id: rule,
                rule_name: rule_name,
                input_columns: col_list,
                input_column_id: col_id_list,
                input_column_names: col_name_list,
                output_column: "",
                priority: pri,
                filters: filter_list,
                params: param_dict
            };
            if (index == 0 && scope[0] == "") {
                rules_list = [];
            }
            else {
                rules_list.push(rules_data);
            }
        });

        return rules_list;
    }

    function get_reconfigure_rule_configuration() {
        let rules_list_recon = [];
        let ind = 0;
        let div_name = getConfigureDiv();

        $(div_name).find(".mt-repeater-item-1").each(function (index) {
            let ui_rule_id = $(this).find('#ui_rule_id').val();
            for (let i = 0; i < global_recon_configuration.length; i++) {
                if (ui_rule_id == global_recon_configuration[i]["ui_rule_id"]) {
                    rules_list_recon.push(global_recon_configuration[i]["rule_txt"]);
                }
            }
            ind = index;
        });

        return {rules_list: rules_list_recon, priority: ind};
    }

    function get_anonymization_rules(priority) {
        let rules_list = [];
        let div_name = getConfigureDiv();

        $(div_name).find(".mt-repeater-item").each(function (index) {
            let rule = $(this).find("#rule_id option:selected").attr("id");
            let rule_name = $(this).find("#rule_id option:selected").text();
            let isCat = $(this).find('#cat').is(':checked');

            let col = $(this).find('#scope').find('.js-data-example-ajax').select2('data');
            let col_list = [];
            let col_name_list = [];
            let col_id_list = [];

            for (let i = 0; i < col.length; i++) {
                col_name_list.push({"id": col[i]["id"], "text": col[i]["text"]});
                col_id_list.push(col[i]["id"]);
                col_list.push(col[i]["id"]);
            }

            let pri = priority + index;
            let rules_data = {
                rule_id: rule,
                rule_name: rule_name,
                input_columns: col_list,
                input_column_id: col_id_list,
                input_column_names: col_name_list,
                output_column: "",
                priority: pri,
                filters: isCat,
                params: ""
            };

            rules_list.push(rules_data);
        });

        return rules_list;
    }

    function get_annotation_rules() {
        let rules_list = [];
        let div_name = getConfigureDiv();

        $(div_name).find(".mt-repeater-item").each(function (index) {
            let scope = $(this).find('.dropdown-toggle').html();
            scope = scope.split(" ", 1);
            let annotation = $(this).find('#annotation').val();

            let col = $(this).find('#scope').find('.js-data-example-ajax').select2('data');
            let col_list = [];
            let col_name_list = [];
            let col_id_list = [];
            if (scope[0] == "Entity") {
                for (let i = 0; i < col.length; i++) {
                    col_name_list.push({"id": col[i]["id"], "text": col[i]["text"]});
                    col_id_list.push(col[i]["id"]);
                    let table_id = col[i]["id"];
                    for (let j = 0; j < global_table_attr_list.length; j++) {
                        if (table_id == global_table_attr_list[j]["id"]) {
                            let metalist = global_table_attr_list[j]["attr_id"];
                            for (let k = 0; k < metalist.length; k++) {
                                col_list.push(metalist[k]);
                            }
                        }
                    }
                }
            }
            else if (scope[0] == "Attribute") {
                for (let i = 0; i < col.length; i++) {
                    col_name_list.push({"id": col[i]["id"], "text": col[i]["text"]});
                    col_id_list.push(col[i]["id"]);
                    col_list.push(col[i]["id"]);
                }
            }
            let rules_data = {
                scope: scope[0],
                input_columns: col_list,
                input_column_id: col_id_list,
                input_column_names: col_name_list,
                output_column: "",
                annotation: annotation
            };
            if (index == 0 && scope[0] == "") {
                rules_list = [];
            }
            else {
                rules_list.push(rules_data);
            }
        });
        return rules_list;
    }

    function get_algo_configuration() {
        let algo_config_list = [];
        let div_name = getConfigureDiv();

        $(div_name).find(".mt-repeater-item").each(function (index) {
            let attribute = $(this).find("#select-attribute option:selected").text();
            let comparator = $(this).find("#comparator option:selected").text();
            algo_config_list.push({"attribute": attribute, "comparator": comparator});
        });
        return algo_config_list;
    }

    function save_app_configuration() {
        $("#spn_check_submit").addClass("visibility-hidden");
        $("#spn_loader").removeClass("hide");
        let data_list = get_refresh_schedule();
        let div_name = getConfigureDiv();

        let rules_list_recon = [];
        let rules_list_create = [];
        let priority = 0;

        if (global_app_type == "DA_MEREL") {
            rules_list_create = get_annotation_rules();
        }
        else if (global_app_type == "DA_DAANO") {
            rules_list_create = get_anonymization_rules(priority);
        }
        else if (global_app_type == "DA_DACLP") {

            if (global_mode == "reconfigure_pipeline") {
                let res = get_reconfigure_rule_configuration();
                rules_list_recon = res.rules_list;
                priority = res.priority;
            }

            rules_list_create = get_rules_configuration(priority);
            user_rules_list_create = get_user_defined_rules_configuration(priority);
        }
        else if (global_app_type == "DA_DASTA") {
            rules_list_create = get_anonymization_rules(priority);
        }
        else {

            if (global_mode == "reconfigure_pipeline") {
                let res = get_reconfigure_rule_configuration();
                rules_list_recon = res.rules_list;
                priority = res.priority;
            }

            rules_list_create = get_rules_configuration(priority);
        }

        let dest_id = global_destination_list;
        let app_type = $(div_name).find('#app_type').val();
        let p_name = $(div_name).find('input[name="pipeline_name"]').val();
        let data;

        if (global_app_type == "DA_MEREL") {
            let rules_list = [];
            let enable_email = $(div_name).find('input#enable_email').is(':checked');
            let email_id = $(div_name).find('#email_id').val();

            if (global_mode == "reconfigure_pipeline") {
                rules_list = $.merge(rules_list_recon, rules_list_create);
                let p_id = $(div_name).find('input[name="p_id"]').val();
                data = JSON.stringify({
                    client_id: localStorage.getItem("client_id"),
                    pipeline_id: p_id,
                    dest_id: dest_id,
                    details: data_list,
                    pipeline_name: p_name,
                    rules: rules_list,
                    enable_email: enable_email,
                    email_id: email_id
                });
            }
            else {
                rules_list = rules_list_create;
                data = JSON.stringify({
                    client_id: localStorage.getItem("client_id"),
                    app_type: app_type,
                    dest_id: dest_id,
                    details: data_list,
                    pipeline_name: p_name,
                    rules: rules_list,
                    enable_email: enable_email,
                    email_id: email_id
                });
            }
        }
        else if (global_app_type == "DA_DAANO") {
            let algorithm = $(div_name).find('#da_algo option:selected').val();
            let kvalue = $(div_name).find('input[name="kvalue"]').val();
            let rules_list = rules_list_create;
            data = JSON.stringify({
                client_id: localStorage.getItem("client_id"),
                app_type: global_app_type,
                dest_id: dest_id,
                details: data_list,
                pipeline_name: p_name,
                rules: rules_list,
                algorithm: algorithm,
                kvalue: kvalue
            });
        }
        else if (global_app_type == "DA_ENTRE") {
            let algo_name;
            let threshold;

            let algo_config_list = get_algo_configuration();
            let block_key = $(div_name).find('#block_key').val();
            let block_algo = $(div_name).find('#block_algo').val();
            let radios = $(div_name).find('input[name="test"]:checked').val();

            if (radios == "Clustering") {
                algo_name = $(div_name).find("#Clustering option:selected").text();
                threshold = "";
            }
            else if (radios == "Classification") {
                algo_name = $(div_name).find("#Classification option:selected").text();
                threshold = $(div_name).find("#threshold").val();
            }

            let data_form = JSON.stringify({
                client_id: localStorage.getItem("client_id"),
                app_type: global_app_type,
                dest_id: dest_id,
                details: data_list,
                pipeline_name: p_name
            });

            let data_extra = JSON.stringify({
                algo_config_list: algo_config_list,
                block_key: block_key,
                block_algo: block_algo,
                algo_name: algo_name,
                threshold: threshold
            });

            data = new FormData();
            data.append('extra', data_extra);
            data.append('data', data_form);
            data.append('file', ($(div_name).find('#file'))[0].files[0]);
        }
        else if (global_app_type == "DA_DACLP") {
            let rules_list = [];
            let user_rules_list = [];
            if (global_mode == "reconfigure_pipeline") {
           
                rules_list = $.merge(rules_list_recon, rules_list_create);
                let p_id = $(div_name).find('input[name="p_id"]').val();
            
                data = JSON.stringify({
                    client_id: localStorage.getItem("client_id"),
                    pipeline_id: p_id,
                    dest_id: dest_id,
                    details: data_list,
                    pipeline_name: p_name,
                    rules: rules_list,
                    user_rules: user_rules_list
                });
            }
            else {
                rules_list = rules_list_create;
                user_rules_list = user_rules_list_create;
                data = JSON.stringify({
                    client_id: localStorage.getItem("client_id"),
                    app_type: global_app_type,
                    dest_id: dest_id,
                    details: data_list,
                    pipeline_name: p_name,
                    rules: rules_list,
                    user_rules: user_rules_list
                });
            }
        }
        else if (global_app_type == "DA_DAMSK" || global_app_type == "DA_SYNDA") {
            let rules_list = [];
            if (global_mode == "reconfigure_pipeline") {
                rules_list = $.merge(rules_list_recon, rules_list_create);
                let p_id = $(div_name).find('input[name="p_id"]').val();
                data = JSON.stringify({
                    client_id: localStorage.getItem("client_id"),
                    pipeline_id: p_id,
                    dest_id: dest_id,
                    details: data_list,
                    pipeline_name: p_name,
                    rules: rules_list,
                    jstree_rule: global_jstree_rule_list
                });
            }
            else {
                rules_list = rules_list_create;
                data = JSON.stringify({
                    client_id: localStorage.getItem("client_id"),
                    app_type: global_app_type,
                    dest_id: dest_id,
                    details: data_list,
                    pipeline_name: p_name,
                    rules: rules_list,
                    jstree_rule: global_jstree_rule_list
                });
            }
        }
        else {
            let rules_list = [];
            if (global_mode == "reconfigure_pipeline") {
                rules_list = $.merge(rules_list_recon, rules_list_create);
                let p_id = $(div_name).find('input[name="p_id"]').val();
                data = JSON.stringify({
                    client_id: localStorage.getItem("client_id"),
                    pipeline_id: p_id,
                    dest_id: dest_id,
                    details: data_list,
                    pipeline_name: p_name,
                    rules: rules_list
                });
            }
            else {
                rules_list = rules_list_create;
                data = JSON.stringify({
                    client_id: localStorage.getItem("client_id"),
                    app_type: global_app_type,
                    dest_id: dest_id,
                    details: data_list,
                    pipeline_name: p_name,
                    rules: rules_list
                });
            }
        }

        // global_source_list = [];
        // global_attribute_list = [];
        // global_destination_list = [];
        // global_jstree_rule_list = [];
        

        if (global_app_type == "DA_ENTRE") {
            $.ajax({
                url: window.location.protocol + '//' + window.location.host + "/update_schedule_file",
                type: 'post',
                data: data,
                contentType: false,
                processData: false,
                dataType: 'json',
                success: function (response) {
                    if (response["status"] == "200" || response["status"] == "SUCCESS:200") {
                        window.open("pipeline", "_self");
                    }else{
                    let alert_element = $('.alert-danger');
                alert_element.html(response["message"]);
                alert_element.show();
                setTimeout(function () {
                    $('.alert-danger').fadeOut();
                }, 3000);
                    }
                }
            });
        }
        else {
          
             $.ajax({
                 url: window.location.protocol + '//' + window.location.host + "/update_schedule",
                 type: 'post',
                 data: data,
                 contentType: 'application/json',
                 dataType: 'json',
                 success: function (response) {
                     if (response["status"] == "200" || response["status"] == "SUCCESS:200") {
                        $("#spn_check_submit").removeClass("visibility-hidden");
                        $("#spn_loader").addClass("hide");
                         window.open("pipeline", "_self");
                     }else {
                      let alert_element = $('.alert-danger');
                 alert_element.html(response["message"]);
                 alert_element.show();
                 $("#spn_check_submit").removeClass("visibility-hidden");
                 $("#spn_loader").addClass("hide");
                 setTimeout(function () {
                     $('.alert-danger').fadeOut();
                 }, 3000);
                         console.log('Error occurred... ' + response["message"]);
                     }
                 }
             });
        }
    }

    let incrementalColumn = "";
    function saveselected_type(sel) {     
        debugger;  
        const name = sel.name.split('-')[1];
        const selectedValue = $(sel).find('option:selected').val();
        global_refresh_types[name] = $(sel).find('option:selected').val();
        global_refresh_type_list=[];
        if (selectedValue === "incremental") {
            const placeholderInput = `
                <div class="col-md-3"><label class="control-label text-light visibility-hidden"><span>Refresh Type</span></label> \
                              <br/><input type="text" class="form-control incremental-placeholder ms-2"
                     placeholder="Enter column name"></div>
             
            `;
            // $(sel).after(placeholderInput);
            $(sel).closest('div').after(placeholderInput);

            $(sel).closest('div').next().find('.incremental-placeholder').on('blur', function () {
            incrementalColumn = $(this).val();
            console.log("Incremental Column Value:", incrementalColumn);
        });
        }
        // const selectedValue = selectElement.value;
        // const tableName = sel.id.split("refresh_interval-")[1];
        // const container = $("#input-container-" + tableName);
        
        // // Remove old input if it exists
        // container.find(".incremental-placeholder").remove();

        // if (selectedValue === "incremental") {
        //     const placeholderInput = `
        //         <div class="col-md-3"><label class="control-label text-light visibility-hidden"><span>Refresh Type</span></label> \
        //                      <br/><input type="text" class="form-control incremental-placeholder ms-2"
        //             placeholder="Enter column name" style="max-width: 200px;"></div>
        //     `;
        //     container.append(placeholderInput); // Add input next to select
        // }
        else if (selectedValue === "complete") {
            // Remove the input field if it exists
            // $(sel).next('.incremental-placeholder').remove();
            $(sel).closest('div').next().find('.incremental-placeholder').closest('div').remove();
        }
        for(let jdx=0;jdx<global_table_list.length;jdx++){
          
            var filteredcolumns = refresh_type_list.filter(function(obj){
                return obj.tableName == global_table_list[jdx];
            });
           
            var col_list = filteredcolumns[0].columnname;
            var selValue = (global_refresh_types[global_table_list[jdx]] == undefined)?"complete":global_refresh_types[global_table_list[jdx]];
            
            
            
            for (let j = 0; j < col_list.length; j++) {             
                let dic1 = col_list[j] + ":" + selValue;  
                global_refresh_type_list.push(dic1) ;
            }
        }
       
         

    }

    function show_selected_time_interval(sel)
    {
     schedule_val= $(sel).find('option:selected').val();
     const name = sel.name.split('-')[1];
     custom_div ="custom_schedule_interval-"+name

     if (schedule_val == 'minutes'){
        buffer='<option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option>'
     }else if(schedule_val == "hours"){
     buffer ='<option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option>'
     }else if(schedule_val == "days")
     {
     buffer = '<option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option>'
     }else if(schedule_val =="months")
     {
     buffer ='<option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option>'
     }
     $('div[name='+custom_div+']').find("#select_time_limit").html(buffer);
    }

    function saveselected_schedule(sel) {
        const name = sel.name.split('-')[1];
        custom_div = "custom_schedule_interval-" + name;
        const $container = $('div[name="' + custom_div + '"]');
        schedule_val= $(sel).find('option:selected').val()
        console.log("Selector: ", 'div[name="' + custom_div + '"]', " => Found:", $container.length);

        if(schedule_val == "custom_schedule")
        {
        // $('div[name='+custom_div+']').show();
        global_refresh_schedules[name]="custom_schedule"
        }
        else
        {
        $('div[name='+custom_div+']').hide();
        global_refresh_schedules[name] = $(sel).find('option:selected').val();
        }
        
        // Clear previous content
        // $container.html("").hide();
        const selectedValue = sel.value;
    const $select = $(sel);
    const $parentCol = $select.closest("div.col-md-3"); // this is the dropdown's column
    const existingInput = $parentCol.next(".schedule-dynamic-field");

    // Remove any previously added field
    if (existingInput.length) {
        existingInput.remove();
    }

    let fieldHtml = "";

    switch (selectedValue) {
        case "daily":
            fieldHtml = `<div class="col-md-3 schedule-dynamic-field"><label class="control-label text-light visibility-hidden"><span>Schedule Interval (in mins)</span></label>
                <input type="text" class="form-control" placeholder="Enter time (e.g., 14:00)">
            </div>`;
            break;

        case "hourly":
            fieldHtml = `<div class="col-md-3 schedule-dynamic-field"><label class="control-label text-light visibility-hidden"><span>Schedule Interval (in mins)</span></label>
                <input type="text" class="form-control" placeholder="Every X hours (e.g., 2)">
            </div>`;
            break;
        
        case "minutes":
            fieldHtml = `<div class="col-md-3 schedule-dynamic-field"><label class="control-label text-light visibility-hidden"><span>Schedule Interval (in mins)</span></label>
                <input type="text" class="form-control" placeholder="Every X minutes (e.g., 2)">
            </div>`;
            break;

        case "weekly": 
            fieldHtml = `<div class="col-md-3 schedule-dynamic-field"><label class="control-label text-light visibility-hidden"><span>Schedule Interval (in mins)</span></label>
                <select class="form-control">
                    <option value="">Select a day</option>
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                </select>
            </div>`;
            break;

        case "monthly":
            fieldHtml = `<div class="col-md-3 schedule-dynamic-field"><label class="control-label text-light visibility-hidden"><span>Schedule Interval (in mins)</span></label>
                <input type="number" class="form-control" placeholder="Day of month (1-31)" min="1" max="31">
            </div>`;
            break;

        case "custom_schedule":
            fieldHtml = `<div class="col-md-3 schedule-dynamic-field"><label class="control-label text-light visibility-hidden"><span>Schedule Interval (in mins)</span></label>
                <input type="datetime-local" class="form-control">
            </div>`;
            break;
    }

    // Append only if a field was generated
    if (fieldHtml) {
        $parentCol.after(fieldHtml);
    }


        // Inject relevant input based on schedule value
        // if (schedule_val === "daily") {
        //     $container.html('<input type="text" class="form-control mt-2" placeholder="Enter time (e.g., 14:00)">').show();
        // } else if (schedule_val === "hourly") {
        //     $container.html('<input type="text" class="form-control mt-2" placeholder="Every X hours (e.g., 2)">').show();
        // } else if (schedule_val === "weekly") {
        //     $container.html(`
        //         <select class="form-control mt-2">
        //             <option value="">Select a day</option>
        //             <option value="sunday">Sunday</option>
        //             <option value="monday">Monday</option>
        //             <option value="tuesday">Tuesday</option>
        //             <option value="wednesday">Wednesday</option>
        //             <option value="thursday">Thursday</option>
        //             <option value="friday">Friday</option>
        //             <option value="saturday">Saturday</option>
        //         </select>
        //     `).show();
        // } else if (schedule_val === "monthly") {
        //     $container.html('<input type="text" class="form-control mt-2" placeholder="Day of month (1-31)" min="1" max="31">').show();
        // } else if (schedule_val === "custom_schedule") {
        //     $container.html(`
        //         <input type="datetime-local" class="form-control mt-2">
        //     `).show();
        // } else {
        //     $container.hide().html(""); // clear if not needed
        // }
        global_schedule_interval_list = []
        for(var s1=0;s1<schema_list.length;s1++){
            var filtered_table_list = global_source_list[0].metadata.filter(function(obj){
                return obj.schema == schema_list[s1];
            });

            for(let jdx=0;jdx<global_table_list.length;jdx++){
          
                var filteredcolumns = filtered_table_list.filter(function(obj){
                    return obj.table == global_table_list[jdx];
                });                
                
                
                for (let j = 0; j < filteredcolumns.length; j++) {  
                    var selValue = (global_refresh_schedules[schema_list[s1]] == undefined)?"once":global_refresh_schedules[schema_list[s1]];          
                    let dic = filteredcolumns[j]["metadata_id"].concat(":").concat(getCronFormat(selValue));
                    global_schedule_interval_list.push(dic);      
                  
                }
            }
        }
        console.log("&&&&&&&&&&&&&&&&&&&&&");
     console.log(global_schedule_interval_list.join(","));
       
       


    }

    return {
        init: init,
        getAppName: getAppName,
        generateTileListSource: generateTileListSource,
        render_source: render_source,
        generateTileListDestination: generateTileListDestination,
        render_destination: render_destination,
        save_source_configuration: save_source_configuration,
        cronToOptionFormat: cronToOptionFormat,
        getRules: getRules,
        getConfiguredSchedule: getConfiguredSchedule,
        getConfigureDiv: getConfigureDiv,
        render_app: render_app,
        get_source_configuration: get_source_configuration,
        get_selected_schedule:get_selected_schedule,
        getCronFormat: getCronFormat,
        getCustomCronFormat: getCustomCronFormat,
        get_refresh_schedule: get_refresh_schedule,
        get_rules_configuration: get_rules_configuration,
        save_app_configuration: save_app_configuration,
        get_reconfigure_rule_configuration: get_reconfigure_rule_configuration,
        get_annotation_rules: get_annotation_rules,
        get_algo_configuration: get_algo_configuration,
        get_anonymization_rules: get_anonymization_rules,
        render_datalabs: render_datalabs,
        getRules_1: getRules_1,
        get_demo_table_configuration: get_demo_table_configuration,
        create_table_from_json: create_table_from_json,
        get_databals_table_configuration: get_databals_table_configuration,
        get_rules_configuration_datalabs: get_rules_configuration_datalabs,
        getUserRules: getUserRules,
        saveselected_type: saveselected_type,
        show_selected_time_interval:show_selected_time_interval,
        saveselected_schedule: saveselected_schedule,
        select_all_source: select_all_source,
        remove_all_source: remove_all_source,
        select_all_destination: select_all_destination,
        remove_all_destination: remove_all_destination,
        save_all_source: save_all_source,
        select_all_save_source: select_all_save_source,
        generateTileListSourceDiv: generateTileListSourceDiv
    };
}();
