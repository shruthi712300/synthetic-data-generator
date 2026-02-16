let graph = new joint.dia.Graph();

let paper = new joint.dia.Paper({
    el: document.getElementById('paper'),
    width: 1000,
    height: 600,
    gridSize: 10,
    model: graph
});

let sPageURL_ = decodeURIComponent(window.location.search.substring(1));
let app_type_key_ = sPageURL_.split('&')[1];
let p_id_key_ = sPageURL_.split('&')[0];
let w_id_ = p_id_key_.split('=')[1];

let app_type_ = app_type_key_.split('=')[1];
const schema_match_entity_url = window.location.protocol + '//' + window.location.host + "/schema_match/entities/data?workflow_id=" + w_id_ + "&app_type=" + app_type_;


// Load the schema match table data and populate the UI table
$.getJSON(schema_match_entity_url, function (json) {
    if (json.status_code !== 200){
        return;
    }

    let matched_result = json.data;
    let source_count = 0;
    let target_count = 0;
    let created_sources = {};
    let created_targets = {};

    for (let match_entry of matched_result.mapped) {
        let source_created = false;
        let target_created = false;
        let source_box_name = match_entry.db_table_name;
        let target_box_name = match_entry.global_table_name;
        let source_box;
        let target_box;

        if (created_sources[source_box_name]) {
            // Skip creating source box
            source_box = created_sources[source_box_name];
        }
        else {
            source_count++;
            source_created = true;
            let y_point = source_count * 100;
            let width = 140;
            if (source_box_name.length >= 14){
                width = source_box_name.length * 11;
            }

            source_box = new joint.shapes.standard.Rectangle({
                position: {x: 50, y: y_point},
                size: {width: width, height: 40},
                attrs: {
                    body: {
                        fill: '#2de5a7',
                        strokeWidth: 0
                    },
                    label: {
                        text: source_box_name,
                        fill: 'white',
                        fontSize: 18,
                        fontWeight: 'bold'
                    }
                }
            });
            created_sources[source_box_name] = source_box;
            graph = graph.addCell([source_box]);
        }

        if (created_targets[target_box_name]) {
            // Skip creating target box
            target_box = created_targets[target_box_name];
        }
        else {
            target_created = true;
            let y_point = (target_count * 80) + 60;
            target_count++;
            let width = 140;
            if (target_box_name.length >= 14){
                width = target_box_name.length * 11;
            }

            target_box = new joint.shapes.standard.Rectangle({
                position: {x: 750, y: y_point},
                size: {width: width, height: 40},
                attrs: {
                    body: {
                        fill: '#2ab4c0',
                        strokeWidth: 0
                    },
                    label: {
                        text: target_box_name,
                        fill: 'white',
                        fontSize: 18,
                        fontWeight: 'bold'
                    }
                }
            });

            created_targets[target_box_name] = target_box;
            graph = graph.addCell([target_box])
        }

        // Create link between source and target
        let link = new joint.shapes.standard.Link({
            source: {id: source_box.id},
            target: {id: target_box.id},
            router: {name: 'manhattan'},
            connector: {name: 'rounded'},
            attrs: {
                line: {
                    stroke: '#333333',
                    strokeWidth: 1
                }
            }
        });
        graph = graph.addCell([link]);
    }


    for (let un_match_entry of matched_result.unmapped) {
        let unmatched_global_name = un_match_entry.global_table_name;
        let unmatched_source_name = un_match_entry.db_table_name;

        if (unmatched_global_name != null) {
            let y_point = (target_count * 80) + 60;
            let width = 140;
            if (unmatched_global_name.length >= 14){
                width = unmatched_global_name.length * 11;
            }
            target_count++;

            let obstacle = new joint.shapes.standard.Rectangle({
                position: {x: 750, y: y_point},
                size: {width: width, height: 40},
                attrs: {
                    body: {
                        fill: '#2ab4c0',
                        strokeWidth: 0
                    },
                    label: {
                        text: unmatched_global_name,
                        fill: 'white',
                        fontSize: 18,
                        fontWeight: 'bold'
                    }
                }
            });
            graph = graph.addCell([obstacle]);
        }
        else if (unmatched_source_name != null) {
            source_count++;
            let y_point = source_count * 100;

            let width = 140;
            if (unmatched_source_name.length >= 14){
                width = unmatched_source_name.length * 11;
            }

            let source_box_obstacle = new joint.shapes.standard.Rectangle({
                position: {x: 50, y: y_point},
                size: {width: width, height: 40},
                attrs: {
                    body: {
                        fill: '#2de5a7',
                        strokeWidth: 0
                    },
                    label: {
                        text: unmatched_source_name,
                        fill: 'white',
                        fontSize: 18,
                        fontWeight: 'bold'
                    }
                }
            });
            graph = graph.addCell([source_box_obstacle]);
        }
    }
});
