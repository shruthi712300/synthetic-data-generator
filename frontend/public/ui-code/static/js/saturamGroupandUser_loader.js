
    function fetchvalue(val) {
        document.getElementById('test_submit').value = val;
    }

//    function fetch_id(data, data1, data2) {
//        $('#group_id').val(data);
//        $('#group_name').val(data1);
//        $('#description').val(data2);
//    }


function fetch_id(data) {
$('#edit_group_id').val(data['group_id']);
$('#edit_group_name').val(data['group_name']);
$('#edit_group_description').val(data['group_description']);
  role=document.getElementsByName('edit_role_id');
   role=role[0].options
  for(let i=0, n=role.length;i<n;i++) {
  let name=role[i].id;
  if(name  == data['role_id'])
  {
   role[i].selected = true;
   break;
 }else
 {
 role[0].selected=true
 }
 }

}

