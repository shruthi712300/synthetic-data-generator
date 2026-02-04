select2 = function(){

function render(this_elem,data2){

    $.fn.select2.defaults.set("theme", "bootstrap");


     $(this_elem).find(".js-data-example-ajax").empty();
     $(this_elem).find(".js-data-example-ajax").select2({
            width: "off",
            data:data2,
            escapeMarkup: function(markup) {
                return markup;
            }, // let our custom formatter work
            minimumInputLength: 1
            //templateResult: formatRepo,
            //templateSelection: formatRepoSelection
        });

     $("button[data-select2-open]").click(function() {
            $("#" + $(this).data("select2-open")).select2("open");
        });

    $(":checkbox").on("click", function() {
        $(this).parent().nextAll("select").prop("disabled", !this.checked);
    });

     $(".select2, .select2-multiple, .select2-allow-clear, .js-data-example-ajax").on("select2:open", function() {
            if ($(this).parents("[class*='has-']").length) {
                var classNames = $(this).parents("[class*='has-']")[0].className.split(/\s+/);

                for (var i = 0; i < classNames.length; ++i) {
                    if (classNames[i].match("has-")) {
                        $("body > .select2-container").addClass(classNames[i]);
                    }
                }
            }
        });

    $(".js-btn-set-scaling-classes").on("click", function() {
        $("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
        $("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
        $(this).removeClass("btn-primary btn-outline").prop("disabled", true);
    });
}


return {
		render : render
	};
}();