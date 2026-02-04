let dateFilterActive = false;
let statusFilterActive = false;

$(function () {
  $('#config-demo').val('Select date');
  $('#config-demo').daterangepicker({
    opens: 'left',
    alwaysShowCalendars: true, // Keeps calendar visible
    autoUpdateInput: false,   // Prevent auto-filling input on init
    locale: {
      format: 'DD-MM-YYYY'
    },
    ranges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
  }, function (start, end, label) {
    debugger;
    dateFilterActive = true;
    $('#config-demo').val(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
    $('#pipelineTable').DataTable().draw();
  });
});



$(document).ready(function () {
    debugger;
    const nonSortableColumns = [];
      $('#pipelineTable thead th').each(function (index) {
        if ($(this).text().trim() === '') {
          nonSortableColumns.push(index);
        }
      });

    const $table = $('#pipelineTable').DataTable({
      columnDefs: [
        {
          targets: [7], // Last column (empty) — disable sorting
          orderable: false
        }
      ],
      language: {
        search: "",
        searchPlaceholder: "Search"
      },
      info: false,
      lengthChange: false
    });
  
    $('#pipelineTable_filter').appendTo('.dataTable-controls');

    $('.filter-dropdown input[type="checkbox"]').on('change', function () {
      debugger;
      statusFilterActive = true;
      $('#pipelineTable').DataTable().draw();
    });
  
    // wrap table once
    const tableElement = $('#pipelineTable');
    if (!tableElement.parent().hasClass('table-responsive')) {
      tableElement.wrap('<div class="table-responsive"></div>');
    }
    $(document).ready(function () {
      $('.filter-dropdown .dropdown-menu').on('click', function(e) {
        e.stopPropagation();
      });
    })
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
      debugger;
      if (dateFilterActive){
        const start = $('#config-demo').data('daterangepicker')?.startDate;
        const end = $('#config-demo').data('daterangepicker')?.endDate;
        const dateStr = data[4]; // Adjust column index if needed
        const rowDate = moment(dateStr, 'YYYY-MM-DD HH:mm:ss'); 
    
        // Apply date filter
        if (start || end || rowDate.isValid()) {
          console.log("Filtering row:", dateStr, "→", rowDate.format('YYYY-MM-DD HH:mm:ss'), "in range?", rowDate.isBetween(start.clone().startOf('day'), end.clone().endOf('day'), null, '[]'));

          if (!rowDate.isBetween(start.clone().startOf('day'), end.clone().endOf('day'), undefined, '[]')) {
            return false;
          }
        }
        return true;
      }
      if (statusFilterActive) {
        if (!statusFilter(data[5])) {
          return false;
        }
        
      }
      return true;
    });

    function statusFilter(rowStatusText) {
      const selectedStatuses = $('.filter-dropdown input[type="checkbox"]:checked')
        .map(function () {
          return $(this).closest('label').text().trim().toLowerCase();
        })
        .get();
    
      const rowStatus = rowStatusText?.trim().toLowerCase();
    
      return selectedStatuses.length === 0 || selectedStatuses.includes(rowStatus);
    }
    
    // const selectedStatuses = [];
    //   $('.filter-dropdown input[type="checkbox"]:checked').each(function () {
    //     selectedStatuses.push($(this).closest('label').text().trim().toLowerCase());
    //   });

    //   const rowStatus = data[5].trim().toLowerCase(); 

    //   if (selectedStatuses.length > 0 && !selectedStatuses.includes(rowStatus)) {
    //     return false;
    //   }

    $('.filter-dropdown input[type="checkbox"]').on('change', function () {
      $table.draw();
    });

    // Fetch data from API
    $.getJSON(
      `${window.location.protocol}//${window.location.host}/pipeline_details?client_id=${localStorage.getItem("client_id")}&pipeline_id=None`,
      function (response) {
        // debugger;
        // response = {
        //     "data": [
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 727, 
        //         "pipeline_name": "expence_master_pipeline", 
        //         "reconfigure": "True", 
        //         "success": "1", 
        //         "total_datacount": "1", 
        //         "created_Date": "	2025-06-17 06:12:11",
        //         "modified_date": "2025-06-17 06:12:11",
        //         "run_time_stamp": "2025-07-08 00:09:57", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 726, 
        //         "pipeline_name": "4master_tables_migration", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "4", 
        //         "created_Date": "2025-06-01",
        //         "modified_date": "2025-06-16",
        //         "run_time_stamp": "10:56:01 IST", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 725, 
        //         "pipeline_name": "Master_tables", 
        //         "reconfigure": "True", 
        //         "success": "2", 
        //         "total_datacount": "4", 
        //         "created_Date": "Jan 16, 2025",
        //         "modified_date": "Jan 16, 2025",
        //         "run_time_stamp": "10:56:01 IST", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "2", 
        //         "pipeline_id": 724, 
        //         "pipeline_name": "n8n_tables_old", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "4", 
        //         "created_Date": "2025-06-01",
        //         "modified_date": "2025-06-16",
        //         "run_time_stamp": "10:56:01 IST",
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 723, 
        //         "pipeline_name": "n8n_tables_migration", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "6", 
        //         "created_Date": "Jan 16, 2025",
        //         "modified_date": "Jan 16, 2025",
        //         "run_time_stamp": "10:56:01 IST", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 722, 
        //         "pipeline_name": "n8n_full_tables", 
        //         "reconfigure": "True", 
        //         "success": "3", 
        //         "total_datacount": "38", 
        //         "created_Date": "Jan 16, 2025",
        //         "modified_date": "Jan 16, 2025",
        //         "run_time_stamp": "10:56:01 IST",
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 721, 
        //         "pipeline_name": "client_email_vinay", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "1", 
        //         "created_Date": "Jan 16, 2025",
        //         "modified_date": "Jan 16, 2025",
        //         "run_time_stamp": "10:56:01 IST",
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 720, 
        //         "pipeline_name": "Jun10-pipeline", 
        //         "reconfigure": "False", 
        //         "success": "0", 
        //         "total_datacount": "1", 
        //         "created_Date": "Jan 16, 2025",
        //         "modified_date": "Jan 16, 2025",
        //         "run_time_stamp": "10:56:01 IST",
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 654, 
        //         "pipeline_name": "srs__shipment_operations_table", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "1", 
        //         "created_Date": "Jan 16, 2025",
        //         "modified_date": "Jan 16, 2025",
        //         "run_time_stamp": "10:56:01 IST",
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 653, 
        //         "pipeline_name": "srs_shipment_operations", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "1", 
        //         "created_Date": "Jan 16, 2025",
        //         "modified_date": "Jan 16, 2025",
        //         "run_time_stamp": "10:56:01 IST",
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 652, 
        //         "pipeline_name": "n8n_tables_new", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "4", 
        //         "created_Date": "Jan 16, 2025",
        //         "modified_date": "Jan 16, 2025",
        //         "run_time_stamp": "10:56:01 IST",
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 651, 
        //         "pipeline_name": "n8n_tables", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "4", 
        //         "created_Date": "Jan 16, 2025",
        //         "modified_date": "Jan 16, 2025",
        //         "run_time_stamp": "10:56:01 IST",
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 650, 
        //         "pipeline_name": "delivery_run_sheet_tables", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "38", 
        //         "created_Date": "Jan 18, 2025",
        //         "modified_date": "Jan 16, 2025",
        //         "run_time_stamp": "10:56:01 IST",
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 647, 
        //         "pipeline_name": "bag_entry_tables", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "12", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 646, 
        //         "pipeline_name": "manifest_details_tables", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "38", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 645, 
        //         "pipeline_name": "manifest_master_tables", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "38", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 644, 
        //         "pipeline_name": "transaction_tables", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "38", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 643, 
        //         "pipeline_name": "payment_receipt_tables", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "38", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 642, 
        //         "pipeline_name": "postgres_tables", 
        //         "reconfigure": "False", 
        //         "success": "0", 
        //         "total_datacount": "2", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 641, 
        //         "pipeline_name": "account_trans_tables", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "38", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 640, 
        //         "pipeline_name": "cash_booking_tables4", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "7", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 639, 
        //         "pipeline_name": "cash_booking_tables3", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "10", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 638, 
        //         "pipeline_name": "cash_booking_tables2", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "11", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 637, 
        //         "pipeline_name": "cash_booking_tables1", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "10", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 635, 
        //         "pipeline_name": "bag_entry_details_tables", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "12", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 634, 
        //         "pipeline_name": "bag_entry", 
        //         "reconfigure": "True", 
        //         "success": "0", 
        //         "total_datacount": "12", 
        //         "total_integrations": 1
        //       }, 
        //       {
        //         "app_icon": "icon_dataIntegrationPipeline.svg", 
        //         "app_type": "DA_DAINT", 
        //         "failure": "0", 
        //         "pipeline_id": 632, 
        //         "pipeline_name": "ps_pincode_master", 
        //         "reconfigure": "False", 
        //         "success": "0", 
        //         "total_datacount": "1", 
        //         "total_integrations": 1
        //       }
        //     ]
        //   }
          
        if (!Array.isArray(response.data)) return;
  
        response.data.forEach(item => {
        // debugger;
        let statusClass = item.success === "0" ? "label label-default" :
                        item.success === "1" ? "label label-info" :
                        item.success === "2" ? "label label-success" :
                        item.success === "3" ? "label label-failed" : "label label-default";
          const rowHtml = `
            <tr>
              <td>
                <div class="d-flex align-items-center fw-600 text-dark">
                  <i class="mr-5">
                    <svg class="display-block" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.99996 13.8332C5.3094 13.8332 4.72007 13.5892 4.23196 13.1012C3.74396 12.6131 3.49996 12.0237 3.49996 11.3332V5.76784C3.11107 5.62339 2.79163 5.39239 2.54163 5.07484C2.29163 4.75728 2.16663 4.39967 2.16663 4.002C2.16663 3.49212 2.34479 3.05873 2.70113 2.70184C3.05746 2.34495 3.49013 2.1665 3.99913 2.1665C4.50824 2.1665 4.94118 2.34495 5.29796 2.70184C5.65485 3.05873 5.83329 3.49212 5.83329 4.002C5.83329 4.39967 5.70829 4.75728 5.45829 5.07484C5.20829 5.39239 4.88885 5.62339 4.49996 5.76784V11.3332C4.49996 11.7457 4.64696 12.0988 4.94096 12.3925C5.23496 12.6863 5.58835 12.8332 6.00113 12.8332C6.41402 12.8332 6.76707 12.6863 7.06029 12.3925C7.3534 12.0988 7.49996 11.7457 7.49996 11.3332V4.6665C7.49996 3.97595 7.74396 3.38661 8.23196 2.8985C8.72007 2.4105 9.3094 2.1665 9.99996 2.1665C10.6905 2.1665 11.2798 2.4105 11.768 2.8985C12.256 3.38661 12.5 3.97595 12.5 4.6665V10.2318C12.8888 10.3763 13.2083 10.6073 13.4583 10.9248C13.7083 11.2424 13.8333 11.6 13.8333 11.9977C13.8333 12.5076 13.6551 12.9409 13.2988 13.2978C12.9425 13.6547 12.5098 13.8332 12.0008 13.8332C11.4917 13.8332 11.0587 13.6547 10.702 13.2978C10.3451 12.9409 10.1666 12.5076 10.1666 11.9977C10.1666 11.6 10.2916 11.2396 10.5416 10.9165C10.7916 10.5934 11.1111 10.3652 11.5 10.2318V4.6665C11.5 4.25395 11.353 3.90084 11.059 3.60717C10.765 3.31339 10.4116 3.1665 9.99879 3.1665C9.5859 3.1665 9.23285 3.31339 8.93963 3.60717C8.64652 3.90084 8.49996 4.25395 8.49996 4.6665V11.3332C8.49996 12.0237 8.25596 12.6131 7.76796 13.1012C7.27985 13.5892 6.69052 13.8332 5.99996 13.8332ZM3.99996 4.83317C4.23163 4.83317 4.4284 4.75217 4.59029 4.59017C4.75229 4.42828 4.83329 4.2315 4.83329 3.99984C4.83329 3.76817 4.75229 3.57139 4.59029 3.4095C4.4284 3.2475 4.23163 3.1665 3.99996 3.1665C3.76829 3.1665 3.57151 3.2475 3.40963 3.4095C3.24763 3.57139 3.16663 3.76817 3.16663 3.99984C3.16663 4.2315 3.24763 4.42828 3.40963 4.59017C3.57151 4.75217 3.76829 4.83317 3.99996 4.83317ZM12 12.8332C12.2316 12.8332 12.4284 12.7522 12.5903 12.5902C12.7523 12.4283 12.8333 12.2315 12.8333 11.9998C12.8333 11.7682 12.7523 11.5714 12.5903 11.4095C12.4284 11.2475 12.2316 11.1665 12 11.1665C11.7683 11.1665 11.5715 11.2475 11.4096 11.4095C11.2476 11.5714 11.1666 11.7682 11.1666 11.9998C11.1666 12.2315 11.2476 12.4283 11.4096 12.5902C11.5715 12.7522 11.7683 12.8332 12 12.8332Z" fill="#717680"/>
                          </svg>
                  </i>
                  ${item.pipeline_name}
                </div>
              </td>
              <td><span class="tbl-pill">${item.total_datacount}</span></td>
              <td>${item.created_Date ? item.created_Date : '-'}</td>
              <td>${item.modified_date ? item.modified_date : '-'}</td>
              <td>${item.run_time_stamp ? item.run_time_stamp : '-'}</td>
              <td>
                <span class="${statusClass}">${item.success === "0" ? "Initialize" : item.success === "1" ? "Running" : item.success === "2" ? "Completed" : item.success === "3" ? "Failed" : "-"}</span>
              </td>
              <td>
                      <div class="d-flex align-items-center">
                        <i class="btn-icon" data-toggle="tooltip" data-placement="top" title="Always visible tooltip" onclick="delete_pipeline(${item.pipeline_id}, '${item.app_type}')">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_2119_2407)">
                            <rect width="16" height="16" fill="tranparent"/>
                            <path d="M4.87183 13.6665C4.53939 13.6665 4.25539 13.5488 4.01983 13.3133C3.78439 13.0778 3.66667 12.7938 3.66667 12.4613V3.99982H3V2.99982H6V2.41016H10V2.99982H13V3.99982H12.3333V12.4613C12.3333 12.7981 12.2167 13.0832 11.9833 13.3165C11.75 13.5498 11.4649 13.6665 11.1282 13.6665H4.87183ZM11.3333 3.99982H4.66667V12.4613C4.66667 12.5212 4.68589 12.5704 4.72433 12.6088C4.76278 12.6473 4.81194 12.6665 4.87183 12.6665H11.1282C11.1795 12.6665 11.2265 12.6451 11.2692 12.6023C11.3119 12.5597 11.3333 12.5127 11.3333 12.4613V3.99982ZM6.26933 11.3332H7.26917V5.33316H6.26933V11.3332ZM8.73083 11.3332H9.73067V5.33316H8.73083V11.3332Z" fill="#A4A7AE"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_2119_2407">
                            <rect width="16" height="16" fill="white"/>
                            </clipPath>
                            </defs>
                          </svg>
                        </i>
                        <i class="btn-icon" onclick="reconfigure_pipeline(${item.pipeline_id}, '${item.app_type}')">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_2119_2410)">
                            <path d="M3.33325 12.6668H4.17425L10.9986 5.8425L10.1576 5.0015L3.33325 11.8258V12.6668ZM2.33325 13.6668V11.4105L11.1269 2.62066C11.2277 2.52911 11.339 2.45838 11.4608 2.4085C11.5826 2.3585 11.7104 2.3335 11.8441 2.3335C11.9778 2.3335 12.1072 2.35722 12.2324 2.40466C12.3578 2.45211 12.4687 2.52755 12.5653 2.631L13.3794 3.45533C13.4829 3.55188 13.5566 3.663 13.6006 3.78866C13.6446 3.91433 13.6666 4.04 13.6666 4.16566C13.6666 4.29977 13.6437 4.42772 13.5979 4.5495C13.5521 4.67139 13.4793 4.78272 13.3794 4.8835L4.58959 13.6668H2.33325ZM10.5708 5.42933L10.1576 5.0015L10.9986 5.8425L10.5708 5.42933Z" fill="#A4A7AE"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_2119_2410">
                            <rect width="16" height="16" fill="white"/>
                            </clipPath>
                            </defs>
                          </svg>
                        </i>
                      </div>
                    </td>
                    <td class="text-right">
                      <button class="btn btn-sm btn-light mlr-0" onclick="monitor_pipeline(${item.pipeline_id}, '${item.app_type}', '${item.reconfigure}')">
                        More 
                        <svg class="ml-5" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.33325 8.00016H12.6666M12.6666 8.00016L7.99992 3.3335M12.6666 8.00016L7.99992 12.6668" stroke="#A4A7AE" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
          `;
          $table.row.add($(rowHtml)).draw();
        });
      }
    );
  });
  
  function monitor_pipeline(_id, _type, reconfig) {
    let p_id = _id
    // $(avalue).find('input[name="p_id"]').val();
    let app_type = _type
    // $(avalue).find('input[name="app_id"]').val();
    let reconfigure = (reconfig === "True") ? 1 : 0;
    
    // $(avalue).find('input[name="reconfigure"]').val();
    let delete_flag = ""
    // $(avalue).find('input[name="delete_flag"]').val();
    // http://de-framework.prayog.io/monitorpipeline?p_id=727&app_type=DA_DAINT&#r=1&d=
    if (app_type == "AA_CHDAA" || app_type == "AA_CSSEG" || app_type == "AA_CULFE") {
        reconfigure="0";
        window.location.href = window.location.protocol + '//' + window.location.host + "/monitorpipeline?p_id=" + p_id + "&app_type=" + app_type + "&#r=" + reconfigure + "&d=" + delete_flag;
    }
    else {
        window.location.href = window.location.protocol + '//' + window.location.host + "/monitorpipeline?p_id=" + p_id + "&app_type=" + app_type + "&#r=" + reconfigure + "&d=" + delete_flag;
    }

    // $('#i_reconfigure').attr("onclick", "reconfigure_pipeline()");
    // $('#i_delete').attr("onclick", "delete_pipeline()");
}
function reconfigure_pipeline(id, type) {
    debugger;
    // let sPageURL = decodeURIComponent(window.location.search.substring(1));
    // let app_type_key = sPageURL.split('&')[1];
    // let p_id_key = sPageURL.split('&')[0];
    let p_id = id;
    let app_type = type;
    window.location.href = window.location.protocol + '//'  + window.location.host + "/datappssources?app_type=" + app_type + "&p_id=" + p_id;
}

function delete_pipeline(id, type) {
    debugger;

    // let sPageURL = decodeURIComponent(window.location.search.substring(1));
    // let app_type_key = sPageURL.split('&')[1];
    // let p_id_key = sPageURL.split('&')[0];
    let p_id = id;
    let app_type = type;

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