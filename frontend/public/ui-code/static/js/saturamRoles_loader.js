function fetchvalue(val) {
    document.getElementById('test_submit').value = val;
}

//function fetch_id(role_id_val, role_name_val, description) {
//    $('#role_id').val(role_id_val);
//    $('#role_name').val(role_name_val);
//    $('#desc').val(description);
//}

$('#test_submit').click(function () {
    let id = document.getElementById('test_submit').value;
    $.ajax({
        url: window.location.protocol + '//' + window.location.host + "/delete_role",
        type: 'POST',
        dataType: "json",
        data: '{"id":"' + id + '"}',
        success: function (response) {
            window.location.href = response.url;
        },
        error: function (response) {
            alert('error');
        }
    });
});

function fetchvalue(val) {
    document.getElementById('test_submit').value = val;
}

function fetch_id(data) {
app_permission_val=0
    $('#edit_role_id').val(data['role_id']);
    $('#edit_role_name').val(data['role_name']);
    $('#edit_desc').val(data['role_description']);

    menus=data['available_menu_permissions']
    console.log("MENUS",menus,menus.includes('Query'))
    if(menus.includes('Welcome')){
    $('#edit_index_screen_id').prop('checked', true);
    }else{
    $('#edit_index_screen_id').prop('checked', false);
    }

    if(menus.includes('Query')){
    $('#edit_query_screen_id').prop('checked', true);
    }else{
    $('#edit_query_screen_id').prop('checked', false);
    }

    if(menus.includes('Reports')){
    $('#edit_report_screen_id').prop('checked', true);
    }else{
    $('#edit_report_screen_id').prop('checked', false);
    }

    if(menus.includes('Workflow')){
    $('#edit_workflow_screen_id').prop('checked', true);
    }else{
    $('#edit_workflow_screen_id').prop('checked', false);
    }

    permissions=data['available_permissions']

    apps=data['available_app_permissions']

   data_app_checkboxes = document.getElementsByName('edit_data_app_ids');
  for(var i=0, n= data_app_checkboxes.length;i<n;i++) {
  let name=data_app_checkboxes[i].id;
  let app_check = apps.indexOf(name);
  if(app_check > -1)
  {
    data_app_checkboxes[i].checked = true;
    app_permission_val="1"
  }else{
  data_app_checkboxes[i].checked = false;
  }
  }

  analytics__app_checkboxes = document.getElementsByName('edit_analytics_app_ids');
  for(let i=0, n=analytics__app_checkboxes.length;i<n;i++) {
  let name=analytics__app_checkboxes[i].id;
  let app_check = apps.indexOf(name);
  if(app_check > -1)
  {
    analytics__app_checkboxes[i].checked = true;
    app_permission_val="1"
  }else{
   analytics__app_checkboxes[i].checked = false;
  }
  }

  pipeline_permissions=document.getElementsByName('edit_app_pipeline_id');
  for(let i=0, n=pipeline_permissions.length;i<n;i++) {
  let name=pipeline_permissions[i].id;
  let permission_check = permissions.indexOf(name);
  if(permission_check > -1)
  {
    pipeline_permissions[i].checked = true;
  }else{
   pipeline_permissions[i].checked = false;
  }
  }


  pipeline__screen_permissions=document.getElementsByName('edit_pipeline_screen_id');
   pipeline__screen_permissions=pipeline__screen_permissions[0].options
  for(let i=0, n=pipeline__screen_permissions.length;i<n;i++) {
  let name=pipeline__screen_permissions[i].id;
  let permission_check = permissions.indexOf(name);
  if(permission_check > -1)
  {
   pipeline__screen_permissions[i].selected = true;
   app_permission_val="2";
   break;
 }else
 {
 pipeline__screen_permissions[0].selected=true
 }
 }

 connector_permissions=document.getElementsByName('edit_connector_id');
 connector_permissions=connector_permissions[0].options
  for(let i=0, n=connector_permissions.length;i<n;i++) {
  let name=connector_permissions[i].id;
  let permission_check =permissions.indexOf(name);
  if(permission_check > -1)
  {
    connector_permissions[i].selected = true;
    break;
  }else{
   connector_permissions[0].selected = true;
  }
  }

if(app_permission_val =="1")
{
 $("div.data-app_content").hide();
 $("#edit_app_and_pipeline").prop("checked", true);
 $("#edit_data-app_content1").show();
}
if(app_permission_val =="2")
{
 $("div.data-app_content").hide();
 $("#edit_pipeline_only").prop("checked", true);
 $("#edit_data-app_content2").show();
}

}


function selectalldataapps(source){
checkboxes = document.getElementsByName('data_app_ids');
for(var i=0, n=checkboxes.length;i<n;i++) {
console.log(source);
checkboxes[i].checked = source.checked;
}
}

function selectallanalyticsapps(source){
  checkboxes = document.getElementsByName('analytics_app_ids');
  for(var i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = source.checked;
  }
  }


function selectalleditdataapps(source){
  checkboxes = document.getElementsByName('edit_data_app_ids');
  for(var i=0, n=checkboxes.length;i<n;i++) {
  console.log(source);
    checkboxes[i].checked = source.checked;
  }
  }

function selectalleditanalyticsapps(source){
  checkboxes = document.getElementsByName('edit_analytics_app_ids');
  for(var i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = source.checked;
  }
  }

$('#test_submit').click(function () {
    let id = document.getElementById('test_submit').value;
    $.ajax({
        url: window.location.protocol + '//' + window.location.host + "/delete_role",
        type: 'POST',
        dataType: "json",
        data: '{"id":"' + id + '"}',
        success: function (response) {
            window.location.href = response.url;
        },
        error: function (response) {
            alert('error');
        }
    });
});


$(".data-apps__radio-select input[name$='radio__data-apps']").click(function () {
        var test = $(this).val();
        $("div.data-app_content").hide();
        $("#data-app_content" + test).show();
      });

$(".data-apps__radio-select input[name$='radio__data-apps_edit']").click(function () {
        var test = $(this).val();

        $("div.data-app_content").hide();
        $("#edit_data-app_content" + test).show();
      });


      $(".click2active li").click(function () {
       let test = $(this).val();
       console.log("anss",test)
        $(this).toggleClass("active");
      });

      $('.select2__no-search .select2').select2({
        minimumResultsForSearch: -1
      });



function roles_form(permission)
{
console.log(permission);
//console.log(this.permissions)

}
