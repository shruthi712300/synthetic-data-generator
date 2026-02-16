saturamTileView = function () {
    let str1 = "../static/assets/pages/img/brands/";
    let str2 = "Configure Your ";
    let str3 = "Connect to ";

    function Tile(intType, intName, execStatus, type, intId, selected) {

        this.intType = intType;
        this.intName = intName;
        this.execStatus = execStatus;
        this.type = type;
        this.intId = intId;
        this.selected = selected;
        return this;
    }

    /*This function helps to render the integration section*/
    function render_integration_section(group_id, integration_type, subject_1) {
        debugger;
        let _t = $('#' + group_id).children(' div.brand-card').clone();
        if (integration_type === "excel") {
            _t.find("a.brand-card-in").off("click").on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/uploaddata';
            });
    
            // Kill click on the card itself
            _t.off("click").on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/uploaddata';
            });
        }
        _t.find('img').attr("src", str1.concat(integration_type, ".jpg"));
        _t.find('.caption-subject').html(str2.concat(subject_1, " Integration"));
        _t.find('input[name="integration_type"]').attr("value", integration_type);
        $('#brandcard-container').find('#branccard-tabs-body').append(_t);
    }

    /*This function helps to render the destination section*/
    function render_destination_section(group_id, integration_type, subject_1) {
        let _t = $('#' + group_id).children(' div.brand-card').clone();
        _t.find('img').attr("src", str1.concat(integration_type, ".jpg"));
        _t.find('.caption-subject').html(str3.concat(subject_1, ""));
        _t.find('input[name="destination_type"]').attr("value", integration_type);
        $('#brandcard-container').append(_t);
    }

    /*This function helps to render the app source section*/
    function render_appsource_section(group_id, integration_type, int_id, int_name, is_selected) {
        let _t = $('#' + group_id).children(' div.brand-card').clone();
        _t.find('img[data-value="type_img"]').attr("src", str1.concat(integration_type, ".jpg"));
        _t.find('.uppercase').html(int_name);
        _t.find('input[name="integration_id"]').attr("value", int_id);
        _t.find('input[name="integration_type"]').attr("value", integration_type);
        _t.find('input[name="integration_name"]').attr("value", int_name);

        if (is_selected) {
            _t.find('div[name="tick"]').addClass("has-selection-tick");
        }

        $('#div_source').find('#brandcard-container').append(_t);
        return _t;
    }

    function render(tileList) {
        $('#brandcard-container').find('#branccard-tabs-body').empty();
        $('#div_destination').find('#brandcard-container').empty();
        $('#div_source').find('#brandcard-container').empty();

        for (let i = 0; i < tileList.length; i++) {
            let tile_info = tileList[i];
            let tile_type = tile_info.type;
            let tile_integration_type = tile_info.intType;

            if (tile_type === "allsource" || tile_type === "All") {
                if (tile_integration_type === "postgres" || tile_integration_type === "ibmdb" || tile_integration_type === "kafka"
                    || tile_integration_type === "sybase" || tile_integration_type === "saphana" || tile_integration_type === "saperp"
                    || tile_integration_type === "teradata" || tile_integration_type === "oracle" || tile_integration_type === "microsoftsqlserver") {
                    render_integration_section('_dummy_0', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "realtime") {
                    render_integration_section('_dummy_realtime', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "azure_blob") {
                    render_integration_section('_dummy_azure_blob_src', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "mysql") {
                    render_integration_section('_dummy_mysql', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "kafka") {
                    render_integration_section('_dummy_kafka', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "osisoft") {
                    render_integration_section('_dummy_osisoft', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "excel") {
                    debugger;
                    render_integration_section('_dummy_excel', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "s3") {
                    render_integration_section('_dummy_s3', tile_integration_type, "S3");
                }
                else if (tile_integration_type === "googlebig") {
                    render_integration_section('_dummy_bq', tile_integration_type, "Google BigQuery");
                }
                else if (tile_integration_type === "gcs") {
                    render_integration_section('_dummy_gcs', tile_integration_type, "Google BigQuery");
                }
                else if (tile_integration_type === "twitter") {
                    render_integration_section('_dummy_twitter', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "facebook") {
                    render_integration_section('_dummy_facebook', tile_integration_type, tile_integration_type);
                } else if (tile_integration_type === "snowflake") {
                    render_integration_section('_dummy_snowflake', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "instagram") {
                    render_integration_section('_dummy_instagram', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "googletrends") {
                    render_integration_section('_dummy_gt', tile_integration_type, "Google Trends");
                }
                else if (tile_integration_type === "hadoop" || tile_integration_type === "hd_insight" || tile_integration_type === "horton_works" || tile_integration_type === "mapr") {
                    render_integration_section('_dummy_hadoop', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "sftp") {
                    render_integration_section('sftp_connector', tile_integration_type, tile_integration_type.toUpperCase());
                }
                else {
                    render_integration_section('_dummy', tile_integration_type, tile_integration_type);
                }
            }
            else if (tile_type === "Relational") {
                if (tile_integration_type === "postgres" || tile_integration_type === "ibmdb" || tile_integration_type === "sybase" || tile_integration_type === "saphana" || tile_integration_type === "saperp"
                    || tile_integration_type === "teradata" || tile_integration_type === "oracle" || tile_integration_type === "microsoftsqlserver") {
                    render_integration_section('_dummy_0', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "mysql") {
                    render_integration_section('_dummy_mysql', tile_integration_type, tile_integration_type);
                }
            }
            else if (tile_type === "Streaming") {
                if (tile_integration_type === "osisoft") {
                    render_integration_section('_dummy_osisoft', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "realtime") {
                    render_integration_section('_dummy_realtime', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "arduino" || tile_integration_type === "android"
                    || tile_integration_type === "kinesis" || tile_integration_type === "sqs" || tile_integration_type === "rabbitmq"
                    || tile_integration_type === "mqtt" || tile_integration_type === "coap" || tile_integration_type === "google_pub"
                    || tile_integration_type === "azure_event_hub" ||
                    tile_integration_type === "telemetrics") {
                    render_integration_section('_dummy', tile_integration_type, tile_integration_type);
                }
                // else if (tile_integration_type === "sftp") {
                //     render_integration_section('sftp_connector', tile_integration_type, tile_integration_type.toUpperCase());
                // }
                else if (tile_integration_type === "kafka") {
                    render_integration_section('kafka_connector', tile_integration_type, tile_integration_type);
                }
                // else if (tile_integration_type === "s3") {
                //     render_integration_section('_dummy_s3', tile_integration_type, tile_integration_type);
                // }
                else if (tile_integration_type === "azure_blob") {
                    render_integration_section('_dummy_azure_blob_src', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "rest-api") {
                    render_integration_section('_dummy', tile_integration_type, tile_integration_type);
                }
                // else {
                //     render_integration_section('_dummy', tile_integration_type, tile_integration_type);
                // }

            }
            else if (tile_type === "Unstructured") {
                if (tile_integration_type === "s3") {
                    render_integration_section('_dummy_s3', tile_integration_type, "S3");
                }
                else if (tile_integration_type === "mongo" || tile_integration_type === "vertica") {
                    render_integration_section('_dummy', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "azure_blob") {
                    render_integration_section('_dummy_azure_blob_src', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "googlebig") {
                    render_integration_section('_dummy_bq', tile_integration_type, "Google BigQuery");
                }
                else if (tile_integration_type === "gcs") {
                    render_integration_section('_dummy_gcs', tile_integration_type, "Google BigQuery");
                }
                else if (tile_integration_type === "twitter") {
                    render_integration_section('_dummy_twitter', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "facebook") {
                    render_integration_section('_dummy_facebook', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "instagram") {
                    render_integration_section('_dummy_instagram', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "googletrends") {
                    render_integration_section('_dummy_gt', tile_integration_type, "Google Trends");
                }
            }
            else if (tile_type === "File") {
                if (tile_integration_type === "excel") {
                    render_integration_section('_dummy_excel', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "azure_blob") {
                    render_integration_section('_dummy_azure_blob_src', tile_integration_type, tile_integration_type);
                }
                // else if (tile_integration_type === "s3") {
                //     render_integration_section('_dummy_s3', tile_integration_type, "S3");
                // }
                // else if (tile_integration_type === "gcs") {
                //     render_integration_section('_dummy_gcs', tile_integration_type, "Google BigQuery");
                // }
                else if (tile_integration_type === "sftp") {
                    render_integration_section('sftp_connector', tile_integration_type, tile_integration_type.toUpperCase());
                }
            }
            else if (tile_type === "Cloud Storage") {
                if (tile_integration_type === "s3") {
                    render_integration_section('_dummy_s3', tile_integration_type, "S3");
                }
                else if (tile_integration_type === "azure_blob") {
                    render_integration_section('_dummy_azure_blob_src', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "googlebig") {
                    render_integration_section('_dummy_bq', tile_integration_type, "Google BigQuery");
                }
                else if (tile_integration_type === "gcs") {
                    render_integration_section('_dummy_gcs', tile_integration_type, "Google BigQuery");
                }
            }
            else if (tile_type === "Hadoop") {
                if (tile_integration_type === "hadoop" || tile_integration_type === "hd_insight" || tile_integration_type === "horton_works" || tile_integration_type === "mapr") {
                    render_integration_section('_dummy_hadoop', tile_integration_type, tile_integration_type);
                }
            }
            else if (tile_type === "Social") {
                if (tile_integration_type === "twitter") {
                    render_integration_section('_dummy_twitter', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "facebook") {
                    render_integration_section('_dummy_facebook', tile_integration_type, tile_integration_type);
                }
            }
            else if (tile_type === "API") {
                if (tile_integration_type === "osisoft") {
                    render_integration_section('_dummy_osisoft', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "saperp") {
                    render_integration_section('_dummy_0', tile_integration_type, tile_integration_type);
                }
                else if (tile_integration_type === "bigbasket" || tile_integration_type === "google" || tile_integration_type === "amazon"
                    || tile_integration_type === "grofers" || tile_integration_type === "googletrends" || tile_integration_type === "arduino"
                    || tile_integration_type === "andriod" || tile_integration_type === "wootric" || tile_integration_type === "goShippo"
                    || tile_integration_type === "github" || tile_integration_type === "braintree" || tile_integration_type === "closeio"
                    || tile_integration_type === "hubspot" || tile_integration_type === "marketo" || tile_integration_type === "gitlab"
                    || tile_integration_type === "harvest" || tile_integration_type === "apple" || tile_integration_type === "freshdesk"
                    || tile_integration_type === "fixer" || tile_integration_type === "mqtt" || tile_integration_type === "saasquatch"
                    || tile_integration_type === "presto" || tile_integration_type === "outbrain") {
                    render_integration_section('_dummy', tile_integration_type, tile_integration_type);
                }
            }
            else if (tile_type === "No SQL") {
                if (tile_integration_type === "mongo" || tile_integration_type === "vertica") {
                    render_integration_section('_dummy', tile_integration_type, tile_integration_type);
                }
            }
            else if (tile_type === "In memory") {
                if (tile_integration_type === "oracle" || tile_integration_type === "saphana") {
                    render_integration_section('_dummy_0', tile_integration_type, tile_integration_type);
                }
            }
            else if (tile_type === "Marketing") {
                if (tile_integration_type === "mixpanel" || tile_integration_type === "google_analytics"
                    || tile_integration_type === "google_ads" || tile_integration_type === "facebook_ads"
                    || tile_integration_type === "appsflyer") {
                    render_integration_section('_dummy', tile_integration_type, tile_integration_type);
                }
            }
            else if (tile_type === "alldestination") {
                if (tile_integration_type === "googlebig") {
                    render_destination_section('_dummy_googlebig', tile_integration_type, "Google BigQuery");
                }
                else if (tile_integration_type === "postgres") {
                    render_destination_section('_dummy_postgres_dest', tile_integration_type, "Postgres");
                }
                else if (tile_integration_type === "mysql") {
                    render_destination_section('_dummy_postgres_dest', tile_integration_type, "MySQL");
                }
                else if (tile_integration_type === "teradata") {
                    render_destination_section('_dummy_teradata_dest', tile_integration_type, "Teradata");
                }
                else if (tile_integration_type === "s3") {
                    render_destination_section('_dummy_s3_dest', tile_integration_type, "S3");
                }
                else if (tile_integration_type === "gcs") {
                    render_destination_section('_dummy_gcs_dest', tile_integration_type, "GCS");
                } else if (tile_integration_type === "adl") {
                    render_destination_section('_dummy_adl_dest', tile_integration_type, "Azure Data Lake");
                } else if (tile_integration_type === "azure_blob") {
                    render_destination_section('_dummy_azure_blob_dest', tile_integration_type, "Azure Blob Storage");
                }
                else {
                    render_destination_section('_dummy_dest', tile_integration_type, tile_integration_type);
                }
            }
            else if (tile_type === "integrationstatus") {
                let _t = $('#_dummy_2').children('div.brand-card').clone();
                _t.find('#int_id').attr("value", tile_info.intId);
                _t.find('#src_img').attr("src", str1.concat(tile_integration_type, ".jpg"));
                _t.find('#int_name').html(tile_info.intName);
                _t.find('#status').html(tile_info.execStatus);
                $('#brandcard-container').append(_t);
            }
            else if (tile_type === "appdestination") {
                let _t = $('#_dummy_3').children('div.brand-card').clone();
                _t.find('img[data-value="type_img"]').attr("src", str1.concat(tile_integration_type, ".jpg"));
                _t.find('.uppercase').html(tile_info.intName);
                _t.find('#destId').attr("value", tile_info.intId);
                if (tile_info.selected) {
                    _t.find('div[name="tick"]').addClass("has-selection-tick");
                }
                $('#div_destination').find('#brandcard-container').append(_t);
            }
            else if (tile_type === "appsource") {
                if (tile_integration_type === "twitter") {
                    render_appsource_section('_dummy_5', tile_integration_type, tile_info.intId, tile_info.intName, tile_info.selected);
                }
                else if (tile_integration_type === "googletrends") {
                    render_appsource_section('_dummy_7', tile_integration_type, tile_info.intId, tile_info.intName, tile_info.selected);
                }
                else if (tile_integration_type === "facebook") {
                    render_appsource_section('_dummy_6', tile_integration_type, tile_info.intId, tile_info.intName, tile_info.selected);
                }
                else {
                    let _t = render_appsource_section('_dummy_4', tile_integration_type, tile_info.intId, tile_info.intName, tile_info.selected);

                    if (tile_integration_type === "postgres" || tile_integration_type === "mysql" || tile_integration_type === "excel" || tile_integration_type === "hadoop") {
                        _t.find('#int_type_img').attr("src", "../static/assets/pages/img/icon-placeholder_database.svg");
                    }
                    else if (tile_integration_type === "s3") {
                        _t.find('#int_type_img').attr("src", "../static/assets/pages/img/icon-placeholder_folder.svg");
                    }
                    else {
                        _t.find('#int_type_img').attr("src", "../static/assets/pages/img/icon-placeholder_api.svg");
                    }
                }
            }
        }
    }

    return {
        render: render,
        Tile: Tile
    };
}();
