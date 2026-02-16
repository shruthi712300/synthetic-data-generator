$(document).ready(function () {
excel_res_val=$('#excel_res_val').val()

    let sPageURL = decodeURIComponent(window.location.search.substring(1));
    const res = sPageURL.split('=')[1];
    if (res == 1 || excel_res_val== "Success") {
        let alert_element = $('.alert-success');
        alert_element.html('Integration Added Successfully');
        alert_element.show();
        setTimeout(function () {
            $('.alert-success').fadeOut();
        }, 3000);
        $("#excel_res_val").val("")
    } else if( res ==0 || excel_res_val== "Failure" ){
        let alert_element = $('.alert-danger');
        alert_element.html('Failed to add Integration');
        alert_element.show();
        setTimeout(function () {
            $('.alert-danger').fadeOut();
        }, 4500);
        $("#excel_res_val").val("")
       }

url=window.location.href
let afterDomain= url.substring(url.lastIndexOf('/') + 1);
let beforeQueryString= url.split("?")[0];
window.history.pushState({}, document.title, beforeQueryString);
load_connectors()
});

function load_connectors()
{

    $.getJSON(window.location.protocol + '//' + window.location.host + "/metadata_sync_status?client_id=" + localStorage.getItem("client_id"), function (json) {
        let json_data = json.data;
        let tileList = [];

        $(json_data).each(function (i, item) {
            let t = new saturamTileView.Tile(item.integration_type, item.integration_name, item.execution_status, "integrationstatus", item.integration_id, "");
            tileList.push(t);
        });
        saturamTileView.render(tileList);
    });

}
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

function delete_integration(avalue) {
    const int_id = $(avalue).find('#int_id').val();
    let data = JSON.stringify({integration_id: int_id});
    $.ajax({
        url: window.location.protocol + '//' + window.location.host + "/delete_integration",
        type: 'post',
        data: data,
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            if (response["status"] == "200" || response["status"] == "SUCCESS:200") {
                let alert_element = $('.alert-success');
                alert_element.html(response["message"]);
                alert_element.show();
               $('html, body').animate( { scrollTop: 0 } );
                setTimeout(function () {
                    $('.alert-success').fadeOut();
                    //window.location.reload();
                    $('#brandcard-container').empty();
                    load_connectors();
                }, 3000);

            }
            else {
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
