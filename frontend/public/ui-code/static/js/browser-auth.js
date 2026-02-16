// browser-auth.js

$(document).ready(() => {
    window.fbAsyncInit = () => {
        window.checkLoginState = (id) => {
            var app_id = $(id).closest('div[class="portlet-body"]').find('#h_app_id').val();
            var app_secret = $(id).closest('div[class="portlet-body"]').find('#h_app_secret').val();
            FB.init({
                appId: app_id,
                cookie: true,
                xfbml: true,
                version: 'v2.10',
            });

            FB.AppEvents.logPageView();

            FB.getLoginStatus((response) => {
                if (response.status === 'connected') {
                    var access_token = response.authResponse.accessToken;
                    $(id).closest('div[class="portlet-body"]').find('#user_auth_1').find("i.font-green").addClass("fa fa-check");

                     $.ajax({
                        url: 'https://graph.facebook.com/oauth/access_token',
                        type: 'GET',
                        data: 'grant_type=fb_exchange_token&client_id=' + app_id + '&client_secret=' + app_secret + '&fb_exchange_token=' + access_token,
                        success: function(response) {
                            $(id).closest('div[class="portlet-body"]').find('#h_user_access').attr("value",response["access_token"]);
                            }
                    });

                } else {
                    FB.login(function(response) {
                        if(response.authResponse) {
                            checkLoginState(id);
                        }
                    });
                }
            });
        };
    };

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.10&appId=2021270551439971';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
});
