function clearModalRadios() {
  $('#jstree-nested-modal').modal('toggle');
  $("input:radio[name='test']").each(function(i) {
     console.log(this.id);
     this.checked = false;
  });
}

function getRules(app_type, mode){
      var div_name = saturamPiperrApp.getConfigureDiv();
  $.getJSON( window.location.protocol + '//' + window.location.host + "/rules?app_type="+app_type, function( json ) {
          console.log(json)
          saturamPiperrApp.getRules(json,"create");

    });

}


function get_distinct_attributes(){
  console.log("inside 4-1");
  var data = saturamPiperrApp.init("get_source_configuration");
    var attr_list = [];
    console.log("inside new func");
    console.log(data.dist_attr);
    if(data.dist_attr.length != 0){
      for(var i=0;i<data.dist_attr.length;i++){
          attr_list.push(data.dist_attr[i]["col_name"]);
      }

      var unique = attr_list.filter(function(itm, i, attr_list) {
          return i == attr_list.indexOf(itm);
      });
      var list_buffer = '<option value="" selected>--Select Attribute--</option>';
      for(var j=0;j<unique.length;j++){
          list_buffer+='<option value="'+unique[j]+'">'+unique[j]+'</option>';
      }
      $('#div_configure_er').find('div#attr_algo:last').find('#select-attribute').html(list_buffer);
    }
}

function add_repeater()
{
  var div_name = saturamPiperrApp.getConfigureDiv();
  var sPageURL = decodeURIComponent(window.location.search.substring(1));
  app_type_key = sPageURL.split('&')[0];
  app_type = app_type_key.split('=')[1];

  if (app_type == "DA_ENTRE") {
    get_distinct_attributes();

  }

  else if (app_type == "AA_CSSEG") {
    $(div_name).find('div#rules:last').find(".js-data-example-ajax").empty();
  var data = saturamPiperrApp.init("get_source_configuration");

  $(div_name).find('div#rules:last').find(".js-data-example-ajax").select2({
     data: data.attr
  })

  getRules(app_type,"repeater");

  }
  else if (app_type == "AA_CHDAA"){
    $(div_name).find('div#rules:last').find(".js-data-example-ajax").empty();
  var data = saturamPiperrApp.init("get_source_configuration");

  $(div_name).find('div#rules:last').find(".js-data-example-ajax").select2({
     data: data.attr
  })

  getRules(app_type,"repeater");

  }
  else{
  console.log(app_type);
    $(div_name).find('div#rules:last').find(".js-data-example-ajax").empty();
    var data2 = [];

    $(div_name).find('div#rules:last').find(".js-data-example-ajax").select2({
       data: data2
    })

    getRules(app_type,"repeater");

  }

}

function remove_editor_obj(sel)
{
  console.log($(sel).closest('#scope_code').val());
  saturamPiperrApp.remove_editor_object_from_list();

}
function add_repeater_code()
{
  saturamPiperrApp.getUserRules();
}

function get_entity(val)
{
var data = saturamPiperrApp.init("get_source_configuration");
console.log(data);
var this_elem = $(val).closest(".row");
$(this_elem).find('.dropdown-toggle').html('Entity <span class="caret"></span>');

if(data.table.length != 0){
  console.log("inside");
  select2.render(this_elem,data.table);
}
}


function get_table(val)
{
var data = saturamPiperrApp.init("get_source_configuration");
console.log(data);
var this_elem = $(val).closest(".row");
$(this_elem).find('.dropdown-toggle').html('Table <span class="caret"></span>');

if(data.table.length != 0){
  console.log("inside");
  select2.render(this_elem,data.table);
}
}


function get_attr(val)
{
var data = saturamPiperrApp.init("get_source_configuration");
var this_elem = $(val).closest(".row");
$(this_elem).find('.dropdown-toggle').html('Attribute <span class="caret"></span>');

if (data.attr.length != 0 ) {
   select2.render(this_elem,data.attr);
}
}


function get_selected_type(sel)
{
console.log(sel.name);
saturamPiperrApp.saveselected_type(sel);
}

function get_selected_schedule(sel)
{
console.log(sel.name);
saturamPiperrApp.saveselected_schedule(sel);
}


function get_selected_time_interval(sel)
{
console.log(sel.name);
saturamPiperrApp.show_selected_time_interval(sel);
}

function getval(sel)
{

var div_name = saturamPiperrApp.getConfigureDiv();
  var sPageURL = decodeURIComponent(window.location.search.substring(1));
  app_type_key = sPageURL.split('&')[0];
  app_type = app_type_key.split('=')[1];

if (app_type == "DA_DAANO"){
  var param = $(sel).find('option:selected').text();
  if(param == "generalize"){
     $(sel).closest('#rules').find('#catdiv').show();
  }
  else{
     $(sel).closest('#rules').find('#catdiv').hide();
  }

}
else{
  var param_list = sel.value.split('$$$');
  var param = param_list[0];
  var tooltip_text = param_list[1];
   $(sel).closest('#rules').find('#rule_desc').attr('title', tooltip_text);
  console.log(param);
  $(sel).closest('#rules').find('#params').empty();
  if (param != "null" && param != "")
  {
  var param_list = param.split(',');
  if (param_list != "null" && param_list != '')
  {
  var rule_prototype = $(sel).find('option:selected').attr("name");
  var buffer = '<div class="form-group col-md-12 col-sm-12"><label class="control-label"><strong>'+rule_prototype+'</strong></label></div>';

  $.each(param_list, function( index, value ) {
        buffer += '<div class="form-group col-md-3 col-sm-3"><label class="control-label">'+value+'</label> \
                   <div class="input-icon"><i class="fa fa-sitemap font-green"></i> \
                   <input type="text" id="'+value+'" value="" class="form-control" placeholder="Enter '+value+'"> \
                   </div></div>';
    });
  $(sel).closest('#rules').find('#params').html(buffer);
  }
}
}
}

function submit_form(){
  saturamPiperrApp.init("save_app_configuration");
}


function delete_condition(this_elem)
{
var div_name = saturamPiperrApp.getConfigureDiv();
$(div_name).find(this_elem).closest('#cond_list').remove()
}

function addcondition(cnd){
var div_name = saturamPiperrApp.getConfigureDiv();
  var buffer = '<div id="cond_list" class="row"> \
                <div class="form-group col-md-4 col-sm-4" id="cond"><label class="control-label"><strong>Select Attribute</strong></label> \
                <select  id="select2-button-addons-single-input-group" class="form-control js-data-example-ajax"> \
                </select></div> \
                <div class="form-group col-md-3 col-sm-3"><label class="control-label"><strong>Condition</strong></label> \
                <br/><select name="select-input" class="form-control" id="cond_id"><option>Select Rule</option> \
                <option value="greaterthan" id="greaterthan">Greater than</option> \
                <option value="lesserthan" id="lesserthan">Lesser than</option> \
                <option value="equals" id="equals">Equals</option> \
                </select></div> \
                <div class="form-group col-md-3 col-sm-3"><label>&nbsp;</label><div class="input-icon"> \
                <i class="fa fa-sitemap font-green"></i><input type="text" id="cond_val" value="" class="form-control" placeholder="Enter value"> \
                </div></div>\
                <div class="form-group col-md-2 col-sm-2"><label>&nbsp;</label><div><button type="button" class="btn green conditionClose" onclick="delete_condition(this)" >Remove </button></div></div> \
                </div>';

  $(div_name).find(cnd).closest('#rules').find('#conditions').append(buffer);

  var data = saturamPiperrApp.init("get_source_configuration");

$(div_name).find('div#cond:last').find(".js-data-example-ajax").empty();
  var data2 = [];

  $(div_name).find('div#rules:last').find(".js-data-example-ajax").select2({
     data: data.attr
  })

}


$("#da_algo").change(function () {
  var algo = $('#da_algo').val();
  var div_name = saturamPiperrApp.getConfigureDiv();
  if(algo == "kanonymity"){
    $(div_name).find('#kvaluediv').show();
  }
  else{
    $(div_name).find('#kvaluediv').hide();
  }
});