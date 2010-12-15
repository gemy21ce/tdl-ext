/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var OPTIONS={
    init:function(){
        OPTIONS.loginscreen();
    },
    showLogin:function(){
        $('#loginpopup').show();
        $("#welcomeScreen").hide();
        $("#loading").hide();
    },
    loginscreen:function(){
        var user;
        if(window.localStorage.user){
            user=JSON.parse(window.localStorage.user);
            $("#welcomeScreen").html(user.username+'\u0645\u0631\u062d\u0628\u0627 \u0628\u0643');
        }else{
            $("#welcomeScreen").html($('#textContainer').html());
        }
    },
    login:function(){
        var username=$("#username").attr('value');
        var password=$("#password").attr('value');
        if(username ==''|| password==''){
            OPTIONS.redCredInput('username', 'password');
            return;
        }
        $("#loginpopup").hide();
        $("#loading").show();
        connect.checkCredentials(username, password, function(){
            var usercred={
                username:username,password:password
            }
            window.localStorage.user=JSON.stringify(usercred);
            OPTIONS.loginscreen();
        }, function(){
            OPTIONS.redCredInput('username', 'password');
            OPTIONS.showLogin();
        });
    },
    redCredInput:function(el1,el2){
        $("#"+el1).addClass('badCred');
        $("#"+el2).addClass('badCred');
    }
}
$(function(){
    OPTIONS.init();
    $('#loginbutton').click(function(){
        OPTIONS.login();
    })
})

