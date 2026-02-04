// The following function helps to highlight the active section in the side bar
(function () {
    let nav = document.getElementById('nav');
    let anchor = nav.getElementsByTagName('a');
    let anchor_list = nav.getElementsByTagName('li');
    let current = window.location.pathname.split('/')[1];

    // Map the sub-pages to the corresponding parent sidebar menu
    if (current === "availabledestination" || current === "integrationstatus") {
        current = "connectors";
    }
    else if (current.startsWith("dataapps") || current.startsWith("datappssources")) {
        current = "dataapps";
    }
    else if (current === "datatuning" || current.startsWith("monitorpipeline")) {
        current = "pipeline";
    }
    else if (current === "query" || current === "reports") {
        current = "pipeline";
    }
    else if (current.startsWith("monitorworkflow") || current.startsWith("schema_match")) {
        current = "workflow";
    }

    let current1 = window.location.protocol + '//' + window.location.host + "/" + current;

    for (let i = 0; i < anchor.length; i++) {
        if (anchor[i] == current1) {
            anchor_list[i].className = "nav-item start active open";
        }
        else if (current == "login") {
            anchor_list[0].className = "nav-item start active open";
        }
    }
})();
