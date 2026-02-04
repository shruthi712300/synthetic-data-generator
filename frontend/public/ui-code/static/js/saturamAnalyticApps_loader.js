// Load the available analytic apps and render them
  $(document).ready(function() {
    $.getJSON( window.location.protocol + '//'+ window.location.host + "/apps?app_type=Analytics App", function( json ) {
        let l = json.data;
        let tileList=[];
        $(l).each(function(i, item){
            let t = new saturamAppView.Tile(item.app_id,item.app_name,item.app_display_name,item.app_display_image,item.app_type);
            tileList.push(t);
        });

        saturamAppView.render(tileList);
     });
  });
