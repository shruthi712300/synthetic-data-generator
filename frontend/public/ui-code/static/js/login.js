$(document).ready(function(){
    let url=window.location.href
    let afterDomain= url.substring(url.lastIndexOf('/') + 1);
    window.history.pushState({}, document.title, "/login" );
    
    let remember_me=localStorage.getItem("remember_me")
    if(remember_me == "true")
    {
    let username = localStorage.getItem("username")
    let password = localStorage.getItem("password")
    $("input[name=username]").val(username);
    $("input[name=password]").val(password);
    $("input[name=remember]").prop('checked', true);
    }else{
    $("input[name=username]").val('');
    $("input[name=password]").val('');
    $("input[name=remember]").prop('checked', false);
    }
    });
    
    
    $('body').on('keypress',function(e){
     var key = (e.keyCode || e.which);
        if(key == 13 || key == 3){
        return event.key != "Enter";
        }
    });
    
    $('input[name=password]').on('keydown', function(e) {
        if (e.which == 13) {
            e.preventDefault();
            login_form()
        }
    });
    
    
    $('input[name=remember]').on('keydown', function(e) {
        if (e.which == 13) {
            e.preventDefault();
            login_form()
        }
    });
    
    
    const secretPass = "sfsmU2AtOJsi";

    function encryptData(text) {
    const data = CryptoJS.AES.encrypt(
        text,
        secretPass
    ).toString();
    return data;
    };

    function login_form()
    {
    debugger;
    username = $("input[name=username]").val();
    password = $("input[name=password]").val();
    
    if( username =='' || password ==''){
    $(".alert-danger").show();
    return
    }
    
    aad = $("input[name=aad]").val();
    remember = $('input[name=remember]').is(":checked")
    aad = $("input[name=aad]").is(":checked")
    $("#spn_sign_in").addClass("visibility-hidden");
    $("#spn_loader").removeClass("hide");
    // $("#spn_sign_in").removeClass("visibility-hidden");
    if(aad)
    {
    aad = 1
    }else
    {
    aad = 0
    }
    data = JSON.stringify({
                    username: username,
                    password: encryptData(password),
                    aad: aad
                });
    
    $.ajax({
           type: 'POST',
           url: window.location.protocol + '//' + window.location.host + "/login",
           data: data,
           contentType: 'application/json',
           success:function(response){
            // debugger;
            // let status = $('#status').val();
            if(response.status == "failed"){
                $("#spn_error").text("Invalid Credentials, Kindly enter valid one!");
                $("#spn_sign_in").removeClass("visibility-hidden");
                $("#spn_loader").addClass("hide");
                return;
            }
           if(remember)
           {
            // debugger;
            localStorage.setItem("remember_me","true");
            localStorage.setItem("username",username);
            localStorage.setItem("password",password);  
            }else
            {
            // debugger;
            localStorage.removeItem("remember_me");
            localStorage.removeItem("username");
            localStorage.removeItem("password");
            }
            document.open();
            document.write(response);
            document.close();
            },error: function (response) {
    
              window.location.href ="login.html"
                 }
         });
         }
    
    