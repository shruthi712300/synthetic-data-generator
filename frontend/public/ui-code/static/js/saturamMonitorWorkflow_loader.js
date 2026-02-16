let p_id = 1;

$(document).ready(function () {
    function drawGraph(div, json) {
        let highlight_color = "#000000";
        let upstream_color = "#2020A0";
        let downstream_color = "#0000FF";

        let nodes = json.nodes;
        let edges = json.edges;

        let tasks = json.tasks;
        let task_instances = json.task_instances;
        let execution_date = "{{ execution_date }}";

        let arrange = "LR";
        let g = dagreD3.json.decode(nodes, edges);

        let duration = 500;
        let stateFocusMap = {
            'no status': false, 'failed': false, 'running': false,
            'queued': false, 'success': false
        };


        let layout = dagreD3.layout().rankDir(arrange).nodeSep(15).rankSep(15);
        let renderer = new dagreD3.Renderer().zoom(false);
        let layout_res = renderer.layout(layout).run(g, d3.select(div));

        let height = layout_res.graph().height + 30;
        $(div).parent().attr('height', height);

        inject_node_ids(tasks);
        update_nodes_states(task_instances);

        d3.selectAll("g.node").on("click", function (d) {
            let name = d3.select(this).text();
            if(d.startsWith("sub_dag_"))
            {
            name = $(this).closest(".col-md-12").find("#graph_title").text();
            }
            $('#dag_code').text();
            if (d.startsWith("dag_") || d.startsWith("sub_dag_")) {
                let code_url = window.location.protocol + '//'  + window.location.host + "/dag_code?dag_id=" + name;

                $.getJSON(code_url, function (json) {
                    if(json.status_code !== 200){
                        console.log(JSON.stringify(json));
                        return;
                    }
                    let dag_code = json.code;
                    if (dag_code.dag_code !== undefined) {
                        let code = dag_code.dag_code;
                        $('#dag_code').html(code);
                        $('#dag_name').text(name);
                        $('#dag_code_pop_up').modal('show');
                    }
                });
            }
        });


        function highlight_nodes(nodes, color) {
            nodes.forEach(function (nodeid) {
                let my_node = d3.select('#' + nodeid + ' rect');
                my_node.style("stroke", color);
            })
        }

        d3.selectAll("g.node").on("mouseover", function (d) {
            d3.select(this).selectAll("rect").style("stroke", highlight_color);
            highlight_nodes(g.predecessors(d), upstream_color);
            highlight_nodes(g.successors(d), downstream_color);

        });

        d3.selectAll("g.node").on("mouseout", function (d) {
            d3.select(this).selectAll("rect").style("stroke", null);
            highlight_nodes(g.predecessors(d), null);
            highlight_nodes(g.successors(d), null);
        });

        d3.selectAll("div.legend_item.state")
            .style("cursor", "pointer")
            .on("mouseover", function () {
                if (!stateIsSet()) {
                    let state = d3.select(this).text();
                    focusState(state);
                }
            })
            .on("mouseout", function () {
                if (!stateIsSet()) {
                    clearFocus();
                }
            });

        d3.selectAll("div.legend_item.state")
            .on("click", function () {
                let state = d3.select(this).text();
                let color = d3.select(this).style("border-color");

                if (!stateFocusMap[state]) {
                    clearFocus();
                    focusState(state, this, color);
                    setFocusMap(state);
                }
                else {
                    clearFocus();
                    setFocusMap();
                }
            });

        function inject_node_ids(tasks) {
            $.each(tasks, function (task_id, task) {
                $('tspan').filter(function (index) {
                    return $(this).text() === task_id;
                })
                    .parent().parent().parent()
                    .attr("id", task_id);
            });
        }


        // Assigning css classes based on state to nodes
        function update_nodes_states(task_instances) {
            $.each(task_instances, function (task_id, ti) {
                $('tspan').filter(function (index) {
                    return $(this).text() === task_id;
                })
                    .parent().parent().parent()
                    .attr("class", "node enter " + ti.state)
                    .attr("data-toggle", "tooltip")
                    .attr("data-original-title", function (d) {
                        // Tooltip
                        let task = tasks[task_id];
                        let tt = "Task_id: " + ti.task_id + "<br>";
                        tt += "Run: " + ti.execution_date + "<br>";
                        if (ti.run_id != undefined) {
                            tt += "run_id: <nobr>" + ti.run_id + "</nobr><br>";
                        }
                        tt += "Operator: " + task.task_type + "<br>";
                        tt += "Started: " + ti.start_date + "<br>";
                        tt += "Ended: " + ti.end_date + "<br>";
                        tt += "Duration: " + ti.duration + "<br>";
                        tt += "State: " + ti.state + "<br>";
                        return tt;
                    });
            });
        }

        function clearFocus() {
            d3.selectAll("g.node")
                .transition(duration)
                .style("opacity", 1);
            d3.selectAll("g.node rect")
                .transition(duration)
                .style("stroke-width", "2px");
            d3.select("g.edgePaths")
                .transition().duration(duration)
                .style("opacity", 1);
            d3.selectAll("div.legend_item.state")
                .style("background-color", null);
        }

        function focusState(state, node, color) {
            d3.selectAll("g.node")
                .transition(duration)
                .style("opacity", 0.2);
            d3.selectAll("g.node." + state)
                .transition(duration)
                .style("opacity", 1);
            d3.selectAll("g.node." + state + " rect")
                .transition(duration)
                .style("stroke-width", "10px")
                .style("opacity", 1);
            d3.select("g.edgePaths")
                .transition().duration(duration)
                .style("opacity", 0.2);
            d3.select(node)
                .style("background-color", color);
        }

        function setFocusMap(state) {
            for (let key in stateFocusMap) {
                stateFocusMap[key] = false;
            }
            if (state != null) {
                stateFocusMap[state] = true;
            }
        }

        function stateIsSet() {
            for (let key in stateFocusMap) {
                if (stateFocusMap[key]) {
                    return true
                }
            }
            return false
        }

        function error(msg) {
            $('#error_msg').html(msg);
            $('#error').show();
            $('#loading').hide();
            $('#chart_section').hide(1000);
            $('#datatable_section').hide(1000);
        }

    }

    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let w_id_key = sPageURL.split('&')[0];
    let workflow_id = w_id_key.split('=')[1];

    let app_id_key = sPageURL.split('&')[1];
    let app_type = app_id_key.split('=')[1];

    let ver_id_key = sPageURL.split('&')[2];
    let version_no = ver_id_key.split('=')[1];

    // Disabling the hyper links
    $('#a_reconfigure').attr("disabled", 'disabled');
    $('#a_delete').attr("disabled", 'disabled');
    $('#a_delete').prop("onclick", null).off("click");
    $('#a_reports').attr("disabled", 'disabled');
    $('#a_lineage').attr("disabled", 'disabled');

    let str1 = "../static/assets/pages/img/icons/";
    $('#icon').attr("src", str1.concat(app_type, ".svg"));


    $.getJSON(window.location.protocol + '//'  + window.location.host + "/workflow_details?workflow_id=" + workflow_id + "&ver=" + version_no, function (json) {
        let workflow_data = json.data;
        let graph_count = 0;
        let workflow_name = workflow_data.name;

        $('.monitor-thumb-subtitle').html(workflow_name);
        $('#page_heading').html(workflow_name);

        console.log(workflow_data);
        let node_info = create_graph_elements(workflow_data.data);
        node_info["tasks"] = {};
        node_info["task_instances"] = {};

        clone_graph_container(node_info, graph_count);

        $('#a_reports').attr("onclick", 'view_reports("https://reports.saturam.com/superset/dashboard/55/")');
        $('#a_reports').show();

        let all_dags = workflow_data.data.filter((item) => item.dag_id != null);

        let all_apps = workflow_data.data.filter((item) => item.app_id != null);

        let global_index = 0;
//         all_apps.forEach(function (item) {
//            global_index = global_index + 1;
//            create_graph_for_app(item, global_index);
//        });

        all_dags.forEach(function (item,) {
            global_index = global_index + 1;
            create_graph_for_dag(item, global_index);
        });
    });


    function clone_graph_container(node_info, graph_count, title = null) {
        let container = $('div[name="graph_container"]').clone();
        const parent_id = 'dig' + graph_count;

        container.attr('name', 'graph_container_' + graph_count);
        container.find('#svg_container').attr('id', 'svg_container_' + graph_count);
        container.find('g[name="graph_parent"]').attr('id', parent_id);
        if (title != null) {
            container.find('#graph_title').html(title);
        }

        $('#root_container').append(container);
        container.show();
        node_info["tasks"] = {};
        drawGraph('#' + parent_id, node_info);
    }

    function create_graph_for_dag(dag_info, index) {
        const dagName = dag_info.dag_name;
        console.log("DAG",dagName)
        const airflow_url = window.location.protocol + '//'  + window.location.host + "/graphdata?dag_id=" + dagName;
//        $.getJSON(airflow_url, function (json) {
//            console.log(json);
//            let graph_data = json;
//
//            let all_edges= graph_data.edges;
//            graph_data.edges = all_edges.map(function (edge) {
//                    edge.u = "sub_dag_"+edge.u
//                    edge.v = "sub_dag_"+edge.v
//                    return edge;
//                }
//            );
//
//            let all_nodes = graph_data.nodes;
//            graph_data.nodes = all_nodes.map(function (node) {
//                    node.value.style = "fill:#e8f7e4;";
//                    node.id = "sub_dag_"+node.id
//                    return node;
//                }
//            );
//
//            if (JSON.stringify(graph_data) !== JSON.stringify({})) {
//            console.log("DAG 2", dagName)
//                clone_graph_container(graph_data, index, dagName);
//            }
//        });
        $.ajax({
  url: airflow_url,
  dataType: 'json',
  async: false,
  success: function(json) {
            console.log(json);
            let graph_data = json;

            let all_edges= graph_data.edges;
            graph_data.edges = all_edges.map(function (edge) {
                    edge.u = "sub_dag_"+edge.u
                    edge.v = "sub_dag_"+edge.v
                    return edge;
                }
            );

            let all_nodes = graph_data.nodes;
            graph_data.nodes = all_nodes.map(function (node) {
                    node.value.style = "fill:#e8f7e4;";
                    node.id = "sub_dag_"+node.id
                    return node;
                }
            );

            if (JSON.stringify(graph_data) !== JSON.stringify({})) {
            console.log("DAG 2", dagName)
                clone_graph_container(graph_data, index, dagName);
            }
  }
});
    }

    function create_graph_for_app(app_info, index) {
        const app_name = app_info.app_name;
        let app_id = app_info.app_id;
        const console_url = window.location.protocol + '//'  + window.location.host + "/app_graph?app_id=" + app_id + "&app_name=" + app_name
        $.getJSON(console_url, function (json) {
            console.log(json);
            let app_data = json;
            let graph_count = 0;
            let node_info = create_app_graph_elements(app_data.data);
            node_info["tasks"] = {};
            node_info["task_instances"] = {};

            clone_graph_container(node_info, index, app_name);
        });
    }

});

function view_lineage() {
    window.location.href = window.location.protocol + '//'  + window.location.host + "/datalineage?pipeline_id=" + p_id + "&app_id=" + app_id;
}

$('#a_lineage').attr("onclick", 'view_lineage()');
$('#a_lineage').show();

function view_reports(url) {
    window.open(url, '_blank');
}

function view_learning_data() {
    window.location.href = window.location.protocol + '//'  + window.location.host + "/datatuning?pipeline_id=" + p_id + "&app_id=" + app_id;
}

function view_performance() {
    window.location.href = window.location.protocol + '//'  + window.location.host + "/modelperformance?pipeline_id=" + p_id + "&app_id=" + app_id;
}

function view_pricing_flow() {
    const url = "http://pricing.bb.saturam.com";
    window.open(url, '_blank');
}

function reconfigure_pipeline() {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let app_id_key = sPageURL.split('&')[1];
    let p_id_key = sPageURL.split('&')[0];
    let p_id = p_id_key.split('=')[1];
    let app_id = app_id_key.split('=')[1];

    window.location.href = window.location.protocol + '//'  + window.location.host + "/datappssources?app_id=" + app_id + "&p_id=" + p_id
}

function delete_workflow() {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let w_id_key = sPageURL.split('&')[0];
    let w_id = w_id_key.split('=')[1];

    let data = JSON.stringify({workflow_id: w_id});
    $.ajax({
        url: window.location.protocol + '//'  + window.location.host + "/delete_workflow",
        type: 'post',
        data: data,
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            if (response["status"] == "200" || response["status"] == "SUCCESS:200") {
                $('.alert-success').html(response["message"]);
                $('.alert-success').show();
                setTimeout(function () {
                    $('.alert-success').fadeOut();
                    window.open("workflow", "_self");
                }, 3000);
            }
            else {
                $('.alert-danger').html(response["message"]);
                $('.alert-danger').show();
                setTimeout(function () {
                    $('.alert-danger').fadeOut();
                    window.open("workflow", "_self");
                }, 3000);
            }
        }
    });
}

function getTableStatus(div) {
    let int_id = $(div).find('#intId').val();
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let p_id_key = sPageURL.split('&')[0];
    let p_id = p_id_key.split('=')[1];
    // $.getJSON(window.location.protocol + '//'  + window.location.host + "/integration_table_status?pipeline_id=" + p_id + "&integration_id=" + int_id, function (json) {
    //     let data = json.data;
    //     $('.inlinepopup').find('#table_status').empty();
    //     let buffer = "";
    //     for (let i = 0; i < data.length; i++) {
    //         if (data[i]["status_type"] == "success") {
    //             buffer += '<div class="col-md-6"><div class="alert alert-block alert-success fade in alert-full-height"> \
    //                            <h5 class="alert-heading"><strong><i class="fa fa-check"></i> Success!</strong></h5> \
    //                            <p>' + data[i]["table_status"] + '</p></div></div>';
    //         }
    //         else if (data[i]["status_type"] == "warning") {
    //             if (data[i].hasOwnProperty("table_name")) {
    //                 buffer += '<div class="col-md-6"><div class="alert alert-block alert-warning fade in alert-full-height"> \
    //                                <h5 class="alert-heading"><strong><i class="fa fa-exclamation-triangle"></i> Warning!</strong></h5> \
    //                                <p><strong>' + data[i]["schema_name"] + ' : ' + data[i]["table_name"] + '</strong></p> \
    //                                <p>' + data[i]["table_status"] + '</p></div></div>';
    //
    //             }
    //             else {
    //                 buffer += '<div class="col-md-6"><div class="alert alert-block alert-warning fade in alert-full-height"> \
    //                                <h5 class="alert-heading"><strong><i class="fa fa-exclamation-triangle"></i> Warning!</strong></h5> \
    //                                <p>' + data[i]["table_status"] + '</p></div></div>';
    //             }
    //         }
    //         else {
    //             buffer += '<div class="col-md-6"><div class="alert alert-block alert-danger fade in alert-full-height"> \
    //                            <h5 class="alert-heading"><strong><i class="fa fa-bell"></i> Error!</strong></h5> \
    //                            <p><strong>' + data[i]["schema_name"] + ' : ' + data[i]["table_name"] + '</strong></p> \
    //                            <p>' + data[i]["table_status"] + '</p></div></div>';
    //         }
    //
    //         $('.inlinepopup').find('#table_status').html(buffer);
    //     }
    // });
}

function create_app_graph_elements(workflow_list) {
    let node_list = [];
    let all_edges = [];

    let prev_nodes = [];
    let current_nodes = [];
    let current_execution_num = 0;

    let index;
    for (index = 0; index < workflow_list.length; index++) {
        let work_item = workflow_list[index];
        if (current_execution_num < work_item.execution_order) {
            current_execution_num = work_item.execution_order;
            prev_nodes = current_nodes;
            current_nodes = [];
        }

        let node = create_app_node(work_item);
        node_list.push(node);

        let node_id = node.id;
        current_nodes.push(node_id);
        let edges = create_edges(prev_nodes, node_id);
        if (edges.length > 0) {
            all_edges.push(...edges);
        }
    }

    return {
        "nodes": node_list,
        "edges": all_edges
    };
}

function create_graph_elements(workflow_list) {
    let node_list = [];
    let all_edges = [];

    let prev_nodes = [];
    let current_nodes = [];
    let current_execution_num = 0;

    let index;
    for (index = 0; index < workflow_list.length; index++) {
        let work_item = workflow_list[index];
        if (current_execution_num < work_item.execution_order) {
            current_execution_num = work_item.execution_order;
            prev_nodes = current_nodes;
            current_nodes = [];
        }

        let node = create_node(work_item);
        node_list.push(node);

        let node_id = node.id;
        current_nodes.push(node_id);
        let edges = create_edges(prev_nodes, node_id);
        if (edges.length > 0) {
            all_edges.push(...edges);
        }
    }

    return {
        "nodes": node_list,
        "edges": all_edges
    };
}

function create_node(work_item) {
    let is_app = work_item.app_id != null;
    let node_id;
    let label;
    if (is_app) {
        node_id = "app_" + work_item.app_id;
        label = work_item.app_name;
    }
    else {
        node_id = "dag_" + work_item.dag_id;
        label = work_item.dag_name;
    }

    let value = {"style": "fill:#e8f7e4;", "labelStyle": "fill:#000;"};
    value["label"] = label;
    return {
        "id": node_id,
        "value": value
    };
}

function create_app_node(work_item) {
    let is_app = work_item.app_id != null;
    let node_id;
    let label;
    if (is_app) {
        node_id = "app-process_" + work_item.execution_order;
        label = work_item.process_name;
    }

    let value = {"style": "fill:#e8f7e4;", "labelStyle": "fill:#000;"};
    value["label"] = label;
    return {
        "id": node_id,
        "value": value
    };
}

function create_edges(sources, target) {
    let edges = [];
    for (let source of sources) {
        let edge = {
            "u": source,
            "v": target
        };
        edges.push(edge);
    }
    return edges;
}

