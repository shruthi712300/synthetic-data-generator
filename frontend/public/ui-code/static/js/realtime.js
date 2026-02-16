function add_realtime_integration(form) {
    const payload = {
        topic: form.topic.value,
        subscription: form.subscription.value,
        target_type: form.target_type.value,
        target_name: form.target_name.value,
        content_type: form.content_type.value
    };

    $('#createLoader').show();
    $('#createButton').prop('disabled', true);
    $('#createLoader').css({ display: 'inline-block', background: 'red' });

    $.ajax({
        url: '/realtime-register',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (res) {
            $('#createLoader').hide();
            $('#createButton').prop('disabled', false);
            $('#createBtnText').css('opacity', '1');

            if (res.error) {
                // Set error modal content
                $('#successModalLabel')
                    .removeClass('text-success')
                    .addClass('text-danger')
                    .text('Duplicate Entry');

                $('.modal-body').text(res.error);

                // Show the modal
                $('#successModal').modal('show');
                return;
            }

            // On success
            $('#successModalLabel')
                .removeClass('text-danger')
                .addClass('text-success')
                .text('Integration Created');

            $('.modal-body').text("Realtime integration registered successfully!");
            $('#successModal').modal('show');
            form.reset();
        },
        error: function (err) {
            $('#createLoader').hide();
            $('#createButton').prop('disabled', false);
            alert("Failed to register.");
            form.reset();
        }
    });

    return false;
}


function loadRealtimeIntegrations() {
    $.ajax({
        url: '/realtime-details',
        type: 'GET',
        success: function (response) {
            if (!Array.isArray(response) || response.length === 0) {
                console.log("No realtime integrations found.");
                return;
            }

            response.forEach(integration => {
                const {
                    id,
                    topic,
                    subscription,
                    target_name,
                    target_type,
                    content_type,
                    status = "on"
                } = integration;

                const isActive = status === 'on';

                const card = `
                    <div class="brand-card brand-db-card brand-card-lg" id="realtime-${id}">
                        <div class="brand-card-in">
                            <div class="brand-card-title">
                                <div class="caption">
                                    <i class="fa fa-bolt text-warning"></i>
                                    <img id="src_img" alt src="../static/assets/pages/img copy/brands/google_pub.jpg" style="width: 80px; height: 48px; object-fit: contain;">
                                    <div class="actions d-flex align-items-center gap-1">
                                        <div class="custom-control custom-switch d-inline-block">
                                            <input type="checkbox" class="custom-control-input" id="toggle-${id}" ${isActive ? 'checked' : ''} 
                                                onchange="toggle_realtime_status('${topic}', '${subscription}', this)">
                                            <label class="custom-control-label" for="toggle-${id}" title="Toggle ON/OFF"></label>
                                        </div>
                                        <a onclick="delete_realtime_integration('${topic}', '${subscription}');" class="bc-action-btn" title="Delete Integration">
                                            <i class="fa fa-trash text-danger"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div class="brand-db-info">
                                <img src="../static/assets/pages/img/icon-placeholder_data-warehouse.svg" alt="Realtime">
                                <span class="bold uppercase text-main">TOPIC: ${topic}</span>
                                <div class="text-muted small">Subscription: ${subscription}</div>
                                <div class="text-muted small">Target: ${target_name} (${target_type})</div>
                                <div class="text-muted small">Content Type: ${content_type}</div>
                            </div>
                        </div>
                    </div>
                `;

                $('#brandcard-container').append(card);
            });
        },
        error: function (err) {
            console.error("Failed to load realtime integrations", err);
        }
    });
}

// Toggle ON/OFF function
function toggle_realtime_status(topic, subscription, checkbox) {
    const status = checkbox.checked ? 'on' : 'off';

    $.ajax({
        url: '/realtime-toggle',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ topic, subscription, status }),
        success: function (res) {
            const label = $(checkbox).closest('.actions').find('label');
            if (status === 'on') {
                label.removeClass('status-danger').addClass('status-success').text('Active');
            } else {
                label.removeClass('status-success').addClass('status-danger').text('Inactive');
            }
            console.log(res.message);
        },
        error: function (err) {
            console.error("Toggle failed", err);
            alert("Failed to toggle the integration status.");
            // Revert checkbox state if failed
            checkbox.checked = !checkbox.checked;
        }
    });
}


// Delete integration function
function delete_realtime_integration(topic, subscription) {
    if (!confirm("Are you sure you want to delete this integration?")) return;

    $.ajax({
        url: '/realtime-delete',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ topic, subscription }),
        success: function (res) {
            // alert("Deleted successfully. Reloading...");
            location.reload();  // or use a targeted remove + reload cards
        },
        error: function (err) {
            console.error("Delete failed", err);
            alert("Failed to delete the integration.");
        }
    });
}


// $(document).ready(function () {
//     if (window.location.pathname === '/integrationstatus') {
//         console.log("Loading realtime integrations on integration status page");
//         loadRealtimeIntegrations();
//     }
// });

function waitForOtherConnectors(callback) {
    const checkInterval = setInterval(() => {
        const hasCards = $('#brandcard-container .brand-card').length > 0;
        if (hasCards) {
            clearInterval(checkInterval);
            callback();
        }
    }, 300); // check every 300ms
}

$(document).ready(function () {
    if (window.location.pathname === "/integrationstatus") {
        waitForOtherConnectors(loadRealtimeIntegrations);
    }
});




