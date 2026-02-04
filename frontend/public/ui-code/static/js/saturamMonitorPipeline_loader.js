$(document).ready(function () {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let app_type_key = sPageURL.split('&')[1];
    let p_id_key = sPageURL.split('&')[0];
    let p_id = p_id_key.split('=')[1];
    let app_type = app_type_key.split('=')[1];
    if (app_type == "DA_SYNDA") {
        let newString = $('#data_points_title').html().replace('Rows Replicated This Month', 'Data Points Generated');
        $('#data_points_title').html(newString);
    }
    else if (app_type == "DA_DAMSK") {
        let newString = $('#data_points_title').html().replace('Rows Replicated This Month', 'Data Points Masked');
        $('#data_points_title').html(newString);
    }
    else if (app_type == "DA_COSIS") {
        let newString = $('#data_points_title').html().replace('Rows Replicated This Month', 'Data Consistency Percentage');
        $('#data_points_title').html(newString);
    }
    else if (app_type == "DA_PIITR") {
        let newString = $('#data_points_title').html().replace('Rows Replicated This Month', 'Count of PIIs Identified');
        $('#data_points_title').html(newString);
    }
    $.getJSON(window.location.protocol + '//' + window.location.host + "/pipeline_integration_status?pipeline_id=" + p_id, function (json) {
        let l = json.data;
        let tileList = [];
        $(l).each(function (i, item) {
            let t = new saturamNotificationTileView.Tile(item.integration_id, item.integration_name, item.integration_status, item.integration_text, item.integration_type);
            tileList.push(t);
        });

        saturamNotificationTileView.render(tileList);

        $(".inlinePopup-container").inlinePopup({
            itemSelector: ".inlinePopup-grid"
        });
    });

    $.getJSON(window.location.protocol + '//' + window.location.host + "/pipeline_error_table?client_id=" + localStorage.getItem("client_id") + "&pipeline_id=" + p_id + "&app_type=" + app_type, function (json) {
        let buffer_td;
        let result_list = json.data;

        if (result_list.length != 0) {
            let buffer_tr = "";
//            if (app_type == "DA_DACLP") {
//                document.getElementById('table_heading_outlier').textContent = 'Outlier Data';
//                for (let i = 0; i < result_list.length; i++) {
//                    let buffer_td = "";
//                    buffer_td += '<td>' + result_list[i]["integration_name"] + '</td>';
//                    buffer_td += '<td>' + result_list[i]["table_name"] + '</td>';
//                    buffer_td += '<td>' + result_list[i]["column_name"] + '</td>';
//                    buffer_td += '<td>' + result_list[i]["outliers"] + '</td>';
//
//                    buffer_tr += '<tr>'.concat(buffer_td).concat('</tr>');
//                }
//                $('#table_rows_outlier').html(buffer_tr);
//
//                $('#outliers_table').show();
//                $('#outliers_example').DataTable({
//                    searching: false,
//                    //"bInfo": false,
//                    //"bLengthChange": false,
//                    scrollY: '50vh',
//                    scrollCollapse: true,
//                });
//            }
           if (app_type == "DA_DAINT" || app_type == "DA_STETL") {
                for (let i = 0; i < result_list.length; i++) {
                    let buffer_td = "";
                    buffer_td += '<td>' + result_list[i]["integration_name"] + '</td>';
                    buffer_td += '<td>' + result_list[i]["table_name"] + '</td>';
                    buffer_td += '<td>' + result_list[i]["file_location"] + '</td>';
                    buffer_td += '<td>' + result_list[i]["error_type"] + '</td>';
                    buffer_td += '<td>' + result_list[i]["error_message"] + '</td>';


                    buffer_tr += '<tr>'.concat(buffer_td).concat('</tr>');
                }
                $('#table_rows').html(buffer_tr);

                $('#error_table').show();
                document.getElementById('column1').textContent = 'Integration Name';
                document.getElementById('column2').textContent = 'Dataset Name';
                $('#example').DataTable({
                    searching: false,
                    //"bInfo": false,
                    //"bLengthChange": false,
                    scrollY: '50vh',
                    scrollCollapse: true,
//                    "columns": [
//                        {"width": "10%"},
//                        {"width": "15%"},
//                        {"width": "25%"},
//                        {"width": "10%"},
//                        {"width": "35%"}
//                    ]
                });
            }
            else {
                for (let i = 0; i < result_list.length; i++) {
                    buffer_td = "";

                    buffer_td += '<td>' + result_list[i]["pipeline_id"] + '</td>';
                    buffer_td += '<td>' + result_list[i]["instance_id"] + '</td>';
                    buffer_td += '<td>' + result_list[i]["error_data"] + '</td>';
                    buffer_td += '<td>' + result_list[i]["error_type"] + '</td>';
                    buffer_td += '<td>' + result_list[i]["reason"] + '</td>';
                    buffer_tr += '<tr>'.concat(buffer_td).concat('</tr>');
                }
                $('#table_rows').html(buffer_tr);

                $('#error_table').show();
                $('#example').DataTable({
                    searching: false,
                    //"bInfo": false,
                    //"bLengthChange": false,
                    scrollY: '50vh',
                    scrollCollapse: true,
                });
            }
        }
    });
     $.getJSON(window.location.protocol + '//'  + window.location.host + "/pipeline_info_table?pipeline_id=" + p_id, function (json) {
        let buffer_td;
        let result_list = json.data;
        console.log(result_list)
        if (result_list.length != 0) {
            let buffer_tr = "";
                for (let i = 0; i < result_list.length; i++) {
                    buffer_td = "";
                    var start_datetime = new Date(result_list[i]["run_start_time"]);
                    var end_datetime = new Date(result_list[i]["run_end_time"]);
                    buffer_td += '<td>' + result_list[i]["instance_id"] + '</td>';
                    buffer_td += '<td>' + start_datetime + '</td>';
                    buffer_td += '<td>' + end_datetime + '</td>';
                    buffer_td += '<td>' + result_list[i]["bytes_received"] + '</td>';
                    buffer_td += '<td>' + result_list[i]["rows_received"] + '</td>';
                    buffer_td += '<td>' + result_list[i]["rows_processed"] + '</td>';
                    buffer_td += '<td>' + result_list[i]["rows_failed"] + '</td>';

                    buffer_tr += '<tr>'.concat(buffer_td).concat('</tr>');
                }

                $('#table_rows_pipeline').html(buffer_tr);

                $('#pipeline_info_table').show();
                $('#pipeline_example').DataTable({
                    searching: false,
                    //"bInfo": false,
                    //"bLengthChange": false,
                    scrollY: '50vh',
                    scrollCollapse: true,
                    "columns": [
                        {"width": "20%"},
                        {"width": "20%"},
                        {"width": "20%"},
                        {"width": "10"},
                        {"width": "10"},
                        {"width": "10%"},
                        {"width": "10%"}
                    ]
                });
        }
    });
});

jQuery(document).ready(function () {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));

    if (window.location.hash == '') {
        window.location.hash = window.name;
    }
    else if (window.location.hash == '#') {
        window.location.hash = window.name;
    }
    window.name = window.location.hash;

    let hash_val = window.location.hash.replace('#', '');
    window.location.hash = '';
    let app_type_key = sPageURL.split('&')[1];
    let p_id_key = sPageURL.split('&')[0];


    let reconfigure_key = hash_val.split('&')[0];
    let reconfigure = reconfigure_key.split('=')[1];

    let delete_key = hash_val.split('&')[1];
    let delete_flag = delete_key.split('=')[1];

    let p_id = p_id_key.split('=')[1];
    let app_type = app_type_key.split('=')[1];

    $.getJSON(window.location.protocol + '//'  + window.location.host + "/pipeline_log?pipeline_id=" + p_id, function (json) {
        for(let i=0; i<json['log'].length; i++){
            console.log(json['log'][i]['schema_name']);
            var li = document.createElement('li')
            var a = document.createElement('a');
            a.href = '#mlops-tab_log_log-' + (i+1);
            a.innerHTML = json['log'][i]['schema_name'];

            if(i == 0){li.setAttribute('class', 'active'); a.setAttribute('aria-expanded', 'true');}
            else {a.setAttribute('aria-expanded', 'false');}
            a.setAttribute('data-toggle', "tab");
            li.appendChild(a);
            document.getElementById('log_tabs').appendChild(li);

            var log_contents = document.getElementById('log_contents');
            var content_title = `<div class="tab-pane" id="mlops-tab_log_log-`+(i+1)+`">
                                    <h3 style="padding: 20px;">` + `</h3>`

            var content_log = `<div style="margin-left: auto; margin-right: 0; height: 600px; width: 97%; background-color: #f2f2f2; padding: 40px; border: solid 1px #e6e6e6; border-radius: 5px; overflow-y: auto;">`;

            for(let j=0; j<json['log'][i]['log'].length; j++){
                content_log = content_log + `<p style="color: #0059b3; font-size: 17px; text-align: left; width: 100%; height: 40px; padding: 5px;">` + json['log'][i]['log'][j]['task_id'] + `</p>
                                            <p style="text-align: left; word-wrap: break-word;">` + json['log'][i]['log'][j]['log_data'] + `</p>`
            }

            log_contents.innerHTML = log_contents.innerHTML + content_title + content_log + '</div></div>';
        }
        if(json['log'].length){ document.getElementById('mlops-tab_log_log-1').className = 'tab-pane active'; }

    });

    if (app_type == "DA_DASTA") {
        $("#data_stand_widget").show();
    }
    else if (app_type == "DA_MEREL") {
        //$('#widget_1').show();
        $('#_title_1').html("Defined Business Annotations");
        $('#_frame_1').html('<iframe  width="600"  height="400"  seamless  frameBorder="0"  scrolling="no"  src="http://35.185.254.218:8088//explore/table/19/?form_data=%7B%22datasource%22%3A%2219__table%22%2C%22viz_type%22%3A%22table%22%2C%22slice_id%22%3A41%2C%22granularity_sqla%22%3A%22ins_time%22%2C%22time_grain_sqla%22%3Anull%2C%22since%22%3A%227+days+ago%22%2C%22until%22%3A%22now%22%2C%22groupby%22%3A%5B%5D%2C%22metrics%22%3A%5B%5D%2C%22include_time%22%3Afalse%2C%22all_columns%22%3A%5B%22metadata_name%22%2C%22annotation%22%5D%2C%22order_by_cols%22%3A%5B%5D%2C%22table_timestamp_format%22%3A%22%25Y-%25m-%25d+%25H%3A%25M%3A%25S%22%2C%22row_limit%22%3Anull%2C%22page_length%22%3A0%2C%22include_search%22%3Afalse%2C%22table_filter%22%3Afalse%2C%22where%22%3A%22CONCAT%28metadata_name%2CCAST%28sequence_id+AS+string%29%29+IN+%28+++++SELECT+++++++CONCAT%28metadata_name%2CCAST%28MAX%28sequence_id%29+AS+string%29%29+++++FROM+Metadata_Dataset.metadata_table++++GROUP+BY+++++++metadata_name%29%22%2C%22having%22%3A%22%22%2C%22filters%22%3A%5B%5D%7D&standalone=true&height=400"></iframe>');

        $('#widget_2').show();
        $('#_title_2').html("Meta Relations - Active Learning");
        $('#_frame_2').html('<iframe  width="850"  height="400"  seamless  frameBorder="0"  scrolling="no"  src="http://35.185.254.218:8088//explore/table/20/?form_data=%7B%22datasource%22%3A%2220__table%22%2C%22viz_type%22%3A%22directed_force%22%2C%22slice_id%22%3A40%2C%22granularity_sqla%22%3Anull%2C%22time_grain_sqla%22%3A%22Time+Column%22%2C%22since%22%3A%227+days+ago%22%2C%22until%22%3A%22now%22%2C%22groupby%22%3A%5B%22source_metadata%22%2C%22target_metadata%22%5D%2C%22metric%22%3A%22count%22%2C%22row_limit%22%3Anull%2C%22link_length%22%3A%22250%22%2C%22charge%22%3A%22-500%22%2C%22where%22%3A%22%22%2C%22having%22%3A%22%22%2C%22filters%22%3A%5B%5D%7D&standalone=true&height=400"></iframe>');
    }
    else if (app_type == "DA_STETL") {
        $('#charts').hide();
        $("#streaming_etl").show();
        $.getJSON(window.location.protocol + '//'  + window.location.host + "/get_data_cleaning_metric?pipeline_id=" + p_id, function (json) {
            var data = json.data[0];
            console.log(json);
            console.log(p_id);
            console.log(data['transformations']);
            $("#streaming_etl").find('#datapoints_transformed').html(data["datapoints_transformed"]);
            $("#streaming_etl").find('#datapoints_failed').html(data["datapoints_failed"]);
        });

        $('#widget_1').show();
        $('#_title_1').html("Data Count By Integration");
        $.getJSON(window.location.protocol + '//'  + window.location.host + "/pipeline_counter_stats?pipeline_id=" + p_id, function (json) {
           
            var myChart = echarts.init(document.getElementById('dis_bar_chart'));

            // Specify the configuration items and data for the chart
            // Specify the configuration items and data for the chart
            var labelOption = {
              normal: {
                  show: true
              }
          };
            var option = {
                legend: {},
                tooltip: {
                trigger: 'axis',
                showContent: true
                },
                dataset: {
                source: [
      
                  ['Time', '01/09/2022 10:01:20 AM', '01/09/2022 10:01:60 AM', '01/09/2022 11:30:20 AM', '01/09/2022 01:27:55 PM', '01/09/2022 02:47:10 PM', '01/09/2022 05:30:28 PM'],
              
                  ['Table 1', 10, 0, 0, 0, 0, 0],
                  ['Table 2', 0, 82, 0, 0, 0, 0],
                  ['Table 3', 0, 0, 69, 0, 0, 0],
                  ['Table 4', 0, 0, 0, 62, 0, 49],
                  ['Table 5', 0, 0, 0, 0, 53, 0]
                ]
                },
                xAxis: { 
                    type: 'category',
                    axisLabel: {
                      rotate: 45
                    },
                    name:'Time' ,
                    nameLocation:'middle',
                    nameTextStyle: {
                        align: 'right',
                    verticalAlign: 'top', 
                             
                    padding: [30, 0, 0, 0],
                    }
                },
                yAxis: { 
                    gridIndex: 0,
                    name:'Number of Triggers',
                    nameLocation:'center',
                    nameTextStyle: {
                        align: 'right',
                    verticalAlign: 'top',		   
                    padding: [-30, -100, 0, 0],
                    } 
                },
                series: [
                {
                    type: 'bar',
                    smooth: true,
                    seriesLayoutBy: 'row',
                    label: labelOption,
                    emphasis: { focus: 'series' }
                
                },
                {
                    type: 'bar',
                    smooth: true,
                    seriesLayoutBy: 'row',
                    label: labelOption,
                    emphasis: { focus: 'series' }
                },
                {
                    type: 'bar',
                    smooth: true,
                    seriesLayoutBy: 'row',
                    label: labelOption,
                    emphasis: { focus: 'series' }
                },
                {
                    type: 'bar',
                    smooth: true,
                    seriesLayoutBy: 'row',
                    label: labelOption,
                },
                {
                    type: 'bar',
                    smooth: true,
                    seriesLayoutBy: 'row',
                    label: labelOption,
                }
                ]
            };
            // Display the chart using the configuration items and data just specified.
            myChart.setOption(option);
        // data_src = {};
            // data_src["key"] = "Data received";
            // data_src["values"] = json.response;
            // nv.addGraph(function () {
            //     let chart = nv.models.discreteBarChart()
            //         .x(function (d) {
            //             return d.month
            //         })
            //         .y(function (d) {
            //             return d.data
            //         })
            //         .staggerLabels(true)
            //         .showValues(true);
            //     chart.xAxis.axisLabel('Month');
            //     chart.yAxis.axisLabel('No of Rows');
            //     chart.yAxis.tickFormat(d3.format('0f'));

            //     d3.select('#dis_bar_chart svg')
            //         .datum([data_src])
            //         .transition().duration(500)
            //         .call(chart);
            //     nv.utils.windowResize(chart.update);
            // });
        });
    }
    else if (app_type == "DA_DAINT") {
        draw_bar_chart(p_id, "5_days")
    }
    else if (app_type == "DA_ENTRE") {
        $('#charts').hide();
        $('#er_charts').show();
        $('#er_charts_train').show();
        $('#er_charts_test').show();

        $.getJSON(window.location.protocol + '//'  + window.location.host + "/get_data_roc?pipeline_id=" + p_id + "&dataset_type=train", function (json) {
            var series_data = json.data;
            console.log("data");
            console.log(series_data);
            $("#auc_score_train").html(json.auc_score);
            $("#highchart_er_train").highcharts({
                chart: {type: 'line', style: {fontFamily: "Open Sans"}},
                xAxis: {title: {text: "<b>False Positive Rate</b>"}},
                yAxis: {
                    title: {text: "<b>True Positive Rate</b>"},
                    plotLines: [{color: "#808080"}]
                },
                title: {text: "<b>Receiver Operating Characteristic</b>", x: -20, y: 20},
                series: [{
                    name: "True Positive Rate",
                    data: series_data
                }]
            });

        });

        $.getJSON(window.location.protocol + '//'  + window.location.host + "/get_data_roc?pipeline_id=" + p_id + "&dataset_type=test", function (json) {
            var series_data = json.data;
            console.log("data");
            console.log(series_data);
            $("#auc_score_test").html(json.auc_score);
            $("#highchart_er_test").highcharts({
                chart: {type: 'line', style: {fontFamily: "Open Sans"}},
                xAxis: {title: {text: "<b>False Positive Rate</b>"}},
                yAxis: {
                    title: {text: "<b>True Positive Rate</b>"},
                    plotLines: [{color: "#808080"}]
                },
                title: {text: "<b>Receiver Operating Characteristic</b>", x: -20, y: 20},
                series: [{
                    name: "True Positive Rate",
                    data: series_data
                }]
            });

        });

    }
    else if (app_type == "DA_DAANO") {
        $('#charts').hide();
        $("#data_anonymization").show();
        $.getJSON(window.location.protocol + '//'  + window.location.host + "/get_data_anonymization_metric?pipeline_id=" + p_id, function (json) {
            var data = json.data[0];
            $('#tot').html(data["tot_no_of_records"]);
            $('#with_k').html(data["clusters_group_equal_k"]);
            $('#more_k').html(data["clusters_group_more_k"]);
            $('#sup_tot').html(data["no_of_records_supressed"]);

        });
    }
    else if (app_type == "DA_DACLP") {
        $('#charts').hide();
        $("#data_cleaning").show();
        $.getJSON(window.location.protocol + '//'  + window.location.host + "/get_data_cleaning_metric?pipeline_id=" + p_id, function (json) {
            var data = json.data[0];
            $("#data_cleaning").find('#datapoints_transformed').html(data["datapoints_transformed"]);
            $("#data_cleaning").find('#datapoints_failed').html(data["datapoints_failed"]);
        });
    }
    else {
        //$('#widget_1').show();
        $('#_title_1').html("Store Product Affinity");
        $('#_frame_1').html('<iframe  width="850"  height="400"  seamless  frameBorder="0"  scrolling="no"  src="http://35.185.254.218:8088//explore/table/23/?form_data=%7B%22datasource%22%3A%2223__table%22%2C%22viz_type%22%3A%22directed_force%22%2C%22slice_id%22%3A42%2C%22granularity_sqla%22%3Anull%2C%22time_grain_sqla%22%3A%22Time+Column%22%2C%22since%22%3A%227+days+ago%22%2C%22until%22%3A%22now%22%2C%22groupby%22%3A%5B%22store_description%22%2C%22product_description%22%5D%2C%22metric%22%3A%22sum__diff_val%22%2C%22row_limit%22%3Anull%2C%22link_length%22%3A%22150%22%2C%22charge%22%3A%22-150%22%2C%22where%22%3A%22%22%2C%22having%22%3A%22%22%2C%22filters%22%3A%5B%5D%7D&standalone=true&height=400"></iframe>');
        // $('#widget_2').show();
        $('#_title_2').html("Product Affinity - Associated Products (Bought)");
        $('#_frame_2').html('<iframe  width="600"  height="400"  seamless  frameBorder="0"  scrolling="no"  src="http://35.185.254.218:8088//explore/table/24/?form_data=%7B%22datasource%22%3A%2224__table%22%2C%22viz_type%22%3A%22directed_force%22%2C%22slice_id%22%3A43%2C%22granularity_sqla%22%3Anull%2C%22time_grain_sqla%22%3A%22Time+Column%22%2C%22since%22%3A%227+days+ago%22%2C%22until%22%3A%22now%22%2C%22groupby%22%3A%5B%22source_product%22%2C%22target_product%22%5D%2C%22metric%22%3A%22count%22%2C%22row_limit%22%3Anull%2C%22link_length%22%3A%22200%22%2C%22charge%22%3A%22-500%22%2C%22where%22%3A%22%22%2C%22having%22%3A%22%22%2C%22filters%22%3A%5B%5D%7D&standalone=true&height=400"></iframe>');
        //$('#widget_3').show();
        $('#_title_3').html("Product Affinity - Associated Products (Exclusive)");
        $('#_frame_3').html('<iframe  width="600"  height="400"  seamless  frameBorder="0"  scrolling="no"  src="http://35.185.254.218:8088//explore/table/25/?form_data=%7B%22datasource%22%3A%2225__table%22%2C%22viz_type%22%3A%22directed_force%22%2C%22slice_id%22%3A44%2C%22granularity_sqla%22%3Anull%2C%22time_grain_sqla%22%3A%22Time+Column%22%2C%22since%22%3A%227+days+ago%22%2C%22until%22%3A%22now%22%2C%22groupby%22%3A%5B%22source_product%22%2C%22target_product%22%5D%2C%22metric%22%3A%22count%22%2C%22row_limit%22%3Anull%2C%22link_length%22%3A%22200%22%2C%22charge%22%3A%22-500%22%2C%22where%22%3A%22%22%2C%22having%22%3A%22%22%2C%22filters%22%3A%5B%5D%7D&standalone=true&height=400"></iframe>');
    }

    if (reconfigure == "0") {
        $('#a_reconfigure').attr("disabled", "disabled");
    }
    else {
        $('#a_reconfigure').attr("onclick", "reconfigure_pipeline()");
    }

//    if (delete_flag == "False") {
//        $('#a_delete').attr("disabled", "disabled");
//    }
//    else {
//        $('#a_delete').attr("onclick", "delete_pipeline()");
//    }

    let str1 = "../static/assets/pages/img/icons/";

    $.getJSON(window.location.protocol + '//' + window.location.host + "/pipeline_details?client_id=" + localStorage.getItem("client_id") + "&pipeline_id=" + p_id, function (json) {
        let l = json.data;
        const element = l[0];
        $('#icon').attr("src", str1.concat(app_type, ".svg"));
        $('.monitor-thumb-subtitle').html(element["pipeline_name"]);
        $('#page_heading').html(element["pipeline_name"]);
        $('#tot_int').html(element["total_integrations"]);
        $('#data_points').html(element["total_datacount"]);
        $('#a_delete').attr("onclick", "delete_pipeline()");

//        if (element["delete_flag"] == "False") {
//            $('#a_delete').attr("disabled", "disabled");
//        }
//        else {
//            $('#a_delete').removeAttr('disabled');
//            $('#a_delete').attr("onclick", "delete_pipeline()");
//        }
    });

    let str = [];

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let j = 0;
    for (let i = 3; i >= 0; i--) {
        let now = new Date();
        now.setDate(1);
        let date = new Date(now.setMonth(now.getMonth() - i));
        str [j] = monthNames[date.getMonth()];
        j++;
    }

    let data_points = [];

    $.getJSON(window.location.protocol + '//'  + window.location.host + "/counter_status?pipeline_id=" + p_id + "&counter_name=total_count&duration=4 month&aggregate=false", function (json) {
        let l = json.data;
        data_points.push(l[0]["counter"]);

        $.getJSON(window.location.protocol + '//'  + window.location.host + "/counter_status?pipeline_id=" + p_id + "&counter_name=total_count&duration=3 month&aggregate=false", function (json1) {
            let l1 = json1.data;
            data_points.push(l1[0]["counter"]);

            $.getJSON(window.location.protocol + '//'  + window.location.host + "/counter_status?pipeline_id=" + p_id + "&counter_name=total_count&duration=2 month&aggregate=false", function (json2) {
                var l2 = json2.data;
                console.log(l2[0]["counter"]);

                data_points.push(l2[0]["counter"]);

                console.log(data_points);

                $.getJSON(window.location.protocol + '//'  + window.location.host + "/counter_status?pipeline_id=" + p_id + "&counter_name=total_count&duration=1 month&aggregate=false", function (json3) {
                    var l3 = json3.data;
                    console.log(l3[0]["counter"]);

                    data_points.push(l3[0]["counter"]);

                    console.log(data_points);

                    $("#highchart_1").highcharts(
                        {
                            chart: {type: 'column', style: {fontFamily: "Open Sans"}},
                            title: {text: "Data Points", x: -20},
                            xAxis: {categories: str},
                            yAxis: {
                                title: {text: "Data Points"},
                                plotLines: [{value: 0, width: 1, color: "#808080"}]
                            },
                            tooltip: {valueSuffix: "Thousand"},
                            plotOptions: {column: {stacking: 'normal'}},
                            legend: {
                                layout: "vertical",
                                align: "right",
                                verticalAlign: "middle",
                                borderWidth: 0
                            },
                            series: [{name: "Data Refresh Cycles", data: data_points}]
                        })

                });


            });
        });
    });

});

function reconfigure_pipeline() {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let app_type_key = sPageURL.split('&')[1];
    let p_id_key = sPageURL.split('&')[0];
    let p_id = p_id_key.split('=')[1];
    let app_type = app_type_key.split('=')[1];
    window.location.href = window.location.protocol + '//'  + window.location.host + "/datappssources?app_type=" + app_type + "&p_id=" + p_id;
}


function delete_pipeline() {

    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let app_type_key = sPageURL.split('&')[1];
    let p_id_key = sPageURL.split('&')[0];
    let p_id = p_id_key.split('=')[1];
    let app_type = app_type_key.split('=')[1];

    let data = JSON.stringify({app_type: app_type, pipeline_id: p_id});
    $.ajax({
        url: window.location.protocol + '//'  + window.location.host + "/delete_pipeline",
        type: 'post',
        data: data,
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            if (response["status"] === "200" || response["status"] === "SUCCESS:200") {
                $('.alert-success').html(response["message"]);
                $('.alert-success').show();
                setTimeout(function () {
                    $('.alert-success').fadeOut();
                    window.open("pipeline", "_self");
                }, 3000);
            }
            else {
                $('.alert-danger').html(response["message"]);
                $('.alert-danger').show();
                setTimeout(function () {
                    $('.alert-danger').fadeOut();
                    window.open("pipeline", "_self");
                }, 3000);
            }
        }
    });
}

function getTableStatus(div) {
    let int_id = $(div).find('input[name="integration_id"]').val();
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let p_id_key = sPageURL.split('&')[0];
    let p_id = p_id_key.split('=')[1];
    if (String(int_id).trim().length === 0)
        return;

    $.getJSON(window.location.protocol + '//'  + window.location.host + "/integration_table_status?pipeline_id=" + p_id + "&integration_id=" + int_id, function (json) {
        let data = json.data;
        $('.inlinepopup').find('#table_status').empty();
        let buffer = "";
        for (let i = 0; i < data.length; i++) {
            if (data[i]["status_type"] == "success") {
                buffer += '<div class="col-md-6"><div class="alert alert-block alert-success fade in alert-full-height"> \
                               <h5 class="alert-heading"><strong><i class="fa fa-check"></i> Success!</strong></h5> \
                               <p>' + data[i]["table_status"] + '</p></div></div>';
            }
            else if (data[i]["status_type"] == "warning") {
                if (data[i].hasOwnProperty("table_name")) {
                    buffer += '<div class="col-md-6"><div class="alert alert-block alert-warning fade in alert-full-height"> \
                                   <h5 class="alert-heading"><strong><i class="fa fa-exclamation-triangle"></i> Warning!</strong></h5> \
                                   <p><strong>' + data[i]["schema_name"] + ' : ' + data[i]["table_name"] + '</strong></p> \
                                   <p>' + data[i]["table_status"] + '</p></div></div>';

                }
                else {
                    buffer += '<div class="col-md-6"><div class="alert alert-block alert-warning fade in alert-full-height"> \
                                   <h5 class="alert-heading"><strong><i class="fa fa-exclamation-triangle"></i> Warning!</strong></h5> \
                                   <p>' + data[i]["table_status"] + '</p></div></div>';
                }
            }
            else {
                buffer += '<div class="col-md-6"><div class="alert alert-block alert-danger fade in alert-full-height"> \
                               <h5 class="alert-heading"><strong><i class="fa fa-bell"></i> Error!</strong></h5> \
                               <p><strong>' + data[i]["schema_name"] + ' : ' + data[i]["table_name"] + '</strong></p> \
                               <p>' + data[i]["table_status"] + '</p></div></div>';
            }

            $('.inlinepopup').find('#table_status').html(buffer);
        }
    });
}

function draw_bar_chart(p_id, time_period) {
    $('#widget_1').show();
    $('#_title_1').html("Data Count By Integration");

    $.getJSON(
        window.location.protocol + '//' + window.location.host + "/pipeline_counter_stats?pipeline_id=" + p_id + "&time_period=" + time_period,
        function (json) {
            var myChart = echarts.init(document.getElementById('dis_bar_chart'));

            const responseData = json.response.data;

            // Dynamically generate a series object for each data row (excluding the first row which is Time)
            const seriesList = [];
            for (let i = 1; i < responseData.length; i++) {
                seriesList.push({
                    type: 'line',
                    smooth: true,
                    seriesLayoutBy: 'row',
                    label: { show: true },
                    emphasis: { focus: 'series' }
                });
            }

            const option = {
                legend: {},
                tooltip: {
                    trigger: 'axis',
                    showContent: true
                },
                xAxis: {
                    type: 'category',
                    axisLabel: {
                        rotate: 45
                    },
                    name: 'Time',
                    nameLocation: 'middle',
                    nameTextStyle: {
                        align: 'right',
                        verticalAlign: 'top',
                        padding: [30, 0, 0, 0]
                    }
                },
                yAxis: {
                    name: 'Number of count',
                    nameLocation: 'center',
                    nameTextStyle: {
                        align: 'right',
                        verticalAlign: 'top',
                        padding: [-30, -100, 0, 0]
                    }
                },
                dataset: {
                    source: responseData
                },
                series: seriesList
            };

            myChart.setOption(option);
        }
    );
}

  $('#chart_submit').click(function () {
    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    let p_id_key = sPageURL.split('&')[0];
    let p_id = p_id_key.split('=')[1];
    time=$("#select-custom-time").val()
    count= $("#select-custom-count").val()
    value= count+"_"+time
    console.log(value)
    draw_bar_chart(p_id, value)
       });

let url = window.location.search;
url = url.split('&d=')[0];
url = url.replace('&d=', '');
