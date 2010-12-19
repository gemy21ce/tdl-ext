/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var OPTIONS={
    init:function(){
        OPTIONS.loginscreen();
        OPTIONS.markSelectedSynchOptions();
    },
    showLogin:function(){
		 $('.popup-overlay').show();
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
		$(".popup-overlay").hide();
        $("#loginpopup").hide();
        $("#loading").show();
        proxy.checkCridentials(username, password, function(){
            var usercred={
                username:username,
                password:password
            }
            window.localStorage.user=JSON.stringify(usercred);
            $("#loading").hide();
            $("#welcomeScreen").show();
            OPTIONS.loginscreen();
        }, function(){
            OPTIONS.redCredInput('username', 'password');
            OPTIONS.showLogin();
        });
    },
    redCredInput:function(el1,el2){
        $("#"+el1).addClass('badCred');
        $("#"+el2).addClass('badCred');
    },
    saveSycnhSettings:function(settings){
        if(!settings || settings.length==0){
            settings=['all'];
        }
        window.localStorage.synchsettings=JSON.stringify({
            settings:settings
        });
    },
    markSelectedSynchOptions:function(){
        if(!window.localStorage.synchsettings){
            OPTIONS.saveSycnhSettings();
        }
        var synch=JSON.parse(window.localStorage.synchsettings);
        for(i in synch.settings){
            $("#synch"+synch.settings[i]).attr('checked',true);
        }
    }
}
$(function(){
    OPTIONS.init();
    $('#loginbutton').click(function(){
        OPTIONS.login();
    });
    $("#sync").click(function(){
        OPTIONS.saveSycnhSettings(util.selectedRows());
    });
    $("#synchall").click(function(){
        if(this.checked){
            $(":checkbox").each(function(){
                this.checked=false;
            });
            this.checked=true;
        }
    });
    $("#synchvimp,#synchimp,#synchreg").click(function(){
        if(this.checked){
            $("#synchall").attr('checked',false);
        }
    });
});

