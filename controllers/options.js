/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var OPTIONS={
    Themes:[{
        'id':0,
        'url':'css/brown.css',
        'thumb':'images/green_bg.jpg'
    },{
        'id':1,
        'url':'css/white.css',
        'thumb':'images/red_bg.jpg'
    },{
        'id':2,
        'url':'brown.css',
        'thumb':'images/blue_bg.jpg'
    }],
    init:function(){
        OPTIONS.loginscreen();
        OPTIONS.markSelectedSynchOptions();
        $("#fancyRadio").html(OPTIONS.getThemes());
    },
    showLogin:function(){
        $('.popup-overlay').show();
        $('#loginpopup').show();
        $("#welcomeScreen").hide();
        $("#loading").hide();
        $("#loginloading").Loadingdotdotdot({
            "speed": 400,
            "maxDots": 4,
            "message":''
        });
        OPTIONS.authSubLogin();
    },
    authSubLogin:function(){
        chrome.tabs.create({
            url:connectURL.baseURL + connectURL.authSub,
            selected:true
        });
        proxy.getAuthSubToken(0, function(ob){
            //store the auth token
            window.localStorage.userAuth=ob.authToken;
            //change ui
            OPTIONS.hideLogin();
            OPTIONS.loginscreen();
        });
    },
    hideLogin:function(){
        $(".popup-overlay").hide();
        $("#loginpopup").hide();
        $("#welcomeScreen").show();
    },
    loginscreen:function(){
        if(window.localStorage.userAuth){
            $("#welcomeScreen").html("<a onclick='OPTIONS.clearSync();' style='' class='close-icon2'></a>"+
                'You Are logged in.');
        }else{
            $("#welcomeScreen").html($('#textContainer').html());
        }
    },
    /**
     * using AuthSub.
     * @deprecated
     */
    login:function(){
        var username=$("#username").attr('value');
        var password=$("#password").attr('value');
        var capcha=$("#captext").val();
        if(username ==''|| password==''){
            OPTIONS.redCredInput('username', 'password');
            return;
        }
        $(".popup-overlay").hide();
        $("#loginpopup").hide();
        $("#loading").show();
        proxy.checkCridentials(username, password,capcha, function(){
            //user ok.
            var usercred={
                username:username,
                password:password
            }
            window.localStorage.user=JSON.stringify(usercred);
            $("#loading").hide();
            $("#welcomeScreen").show();
            OPTIONS.loginscreen();
        }, function(){
            //handling not user error
            OPTIONS.redCredInput('username', 'password');
            OPTIONS.showLogin();
        },function(ob){
            //capcha req.
            $("#capchareq").show();
            $("#capimg").attr('src',ob.capurl);
        });
    },
    clearSync:function(){
        delete window.localStorage.userAuth;
        OPTIONS.loginscreen();
    },
    /**
     * using Auth Sub
     * @deprecated
     */
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
        $.prompt('\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062a\u0639\u062f\u064a\u0644\u0627\u062a \u0648\u0633\u064a\u062a\u0645 \u0627\u0644\u062a\u0632\u0627\u0645\u0646 \u062a\u0644\u0642\u0627\u0626\u064a\u0627',{
            buttons:{},//
            prefix:'jqismooth',
            timeout:3000
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
    },
    getThemes:function(){
        if(window.localStorage.theme == null || window.localStorage.theme == undefined){
            window.localStorage.theme=JSON.stringify(OPTIONS.Themes[0]);
        }
        OPTIONS.Theme=JSON.parse(window.localStorage.theme);

        var out='<table class="radioTable RTMbps" border="0" cellpadding="0" cellspacing="0">';
        var tr1="<tr>";
        var tr2='<tr class="send-tr">';
        for(i=0;i< OPTIONS.Themes.length; i++){
            var count=5+i;
            if(i==OPTIONS.Theme.id){
                tr1+='<td class="highlight '+count+'"><img src="'+OPTIONS.Themes[i].thumb+'" alt="" width="150"  /></td>';
                tr2+='<td class=" highlight '+count+'"><input class="radioDemo" name="Mbps"value="5Mbps" type="radio" /><a style="cursor:pointer;" onclick="OPTIONS.setTheme('+OPTIONS.Themes[i].id+')" class="signup Mbps" title="'+count+'"><strong>أضف</strong></a></td>';
            }else{
                tr1+='<td class="'+count+'"><img src="'+OPTIONS.Themes[i].thumb+'" alt="" width="150"  /></td>';
                tr2+='<td class="'+count+'"><input class="radioDemo" name="Mbps"value="5Mbps" type="radio" /><a style="cursor:pointer;" onclick="OPTIONS.setTheme('+OPTIONS.Themes[i].id+')" class="signup Mbps" title="'+count+'"><strong>أضف</strong></a></td>';
            }

        }
        tr1+='</tr>';
        tr2+='</tr>';
        out+=tr1+tr2;
        out+="</table>";
        return out;
    },
    setTheme:function(id){
        window.localStorage.theme=JSON.stringify(OPTIONS.Themes[id]);
    }
    
}
$(function(){
    OPTIONS.init();
    /*
    $('#loginbutton').click(function(){
        OPTIONS.login();
    });
    */
    $("#closeLogin").click(function(){
        OPTIONS.hideLogin();
    })
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
    $("a.DDR").click(function() { //check for the first selection
        var $column = $(this).attr('title'); // assign the ID of the column
        $('table.RTDDR').children().find("td").removeClass("highlight") //forget the last highlighted column
        $('table.RTDDR').children().find("td."+$column).addClass("highlight"); //highlight the selected column
        $('table.RTDDR').children().find("td."+$column).find(":radio").attr("checked","checked");
        return false;
    });
    $("a.Mbps").click(function() { //check for the second selection
        var $column = $(this).attr('title'); // assign the ID of the column
        $('table.RTMbps').children().find("td").removeClass("highlight"); //forget the last highlighted column
        $('table.RTMbps').children().find("td."+$column).addClass("highlight"); //highlight the selected column
        $('table.RTMbps').children().find("td."+$column).find(":radio").attr("checked","checked");
        return false;
    });
    $("button.sendit").click(function() {
        var $DDR = $('table.RTDDR').children().find("td").find(":checked").val();
        var $Mbps = $('table.RTMbps').children().find("td").find(":checked").val();
        alert('You selected '+$DDR+' of RAM, and '+$Mbps+' Bandwidth, for example');
        return false;
    });
});

