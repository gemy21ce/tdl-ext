/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var connectURL={
    //baseURL:'http://192.168.1.155:8080/CalendarProxy',
    //baseURL:'http://todolist.activedd.com',
    baseURL:'http://calendar.activedd.com',
    //    baseURL:'http://localhost:8084/cp',
    checkCred:'/proxy/checkcred.htm',
    postEvent:'/proxy/createtask.htm',
    authSub:'/authsub/login.htm?nextcallback=../extensionloginthanks.htm',
    fetchToken:'/authsub/fetchtoken.htm',
    updateTask:'/proxy/updteTask.hmt'
}
var proxy={
    checkCridentials:function(username,password,capcha,successhandler,failerhandler,capchaHandler){
        $.ajax({
            url:connectURL.baseURL+connectURL.checkCred,
            type:'POST',
            data:{
                username:username,
                password:password,
                captcha:capcha
            },
            success:function(resp){
                switch (resp.status){
                    case '200':{
                        //ok
                        successhandler();
                        break;
                    }
                    case '501':{
                        //invalide user name
                        failerhandler();
                        break;
                    }
                    case '502':{
                        //capcha req
                        capchaHandler(resp);
                        break;
                    }
                    default:{
                        console.log('Error!!!');
                        window.location.reload();
                    }
                }
            }
        })
    },
    saveTask:function(eventTitle,eventContent,startDate,endDate,byday,freq,until,id,handler){
        if(! window.localStorage.userAuth){
            return;
        }
        byday=util.dayInWeek(startDate);
        startDate=util.icalrfc2445Date(startDate,"/");
        endDate=util.icalrfc2445Date(endDate,"/");
        until=util.icalrfc2445Date(until, "/");
        var user=window.localStorage.userAuth;
        $.ajax({
            url:connectURL.baseURL+connectURL.postEvent,
            dataType:'json',
            type:'POST',
            data:{
                id:id,
                userauth:user,
                title:eventTitle,
                content:eventContent,
                dtstart:startDate,
                dtend:endDate,
                freq:freq,
                byday:byday,
                until:until
            },
            success:function(res){
                handler(res);
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
                
            }
        })
    },
    getAuthSubToken:function(count,handler){
        if(! count){
            count=0;
        }
        $.ajax({
            url:connectURL.baseURL+connectURL.fetchToken,
            dataType:'json',
            success:function(ob){
                if((! ob || !ob.status == '200')&& count < 60){
                    window.setTimeout(function (){
                        proxy.getAuthSubToken(count+1, handler);
                    }, 1000);
                }else{
                    handler(ob);
                }
            },
            error:function(){
                if(count<60){
                    window.setTimeout(function(){
                        proxy.getAuthSubToken(count+1, handler);
                    }, 1000);
                }
            }
        })
    },
    updateTask:function(icalUID,eventTitle,eventContent,startDate,endDate,byday,freq,until,handler){
        if(! window.localStorage.userAuth){
            return;
        }
        byday=util.dayInWeek(startDate);
        startDate=util.icalrfc2445Date(startDate,"/");
        endDate=util.icalrfc2445Date(endDate,"/");
        until=util.icalrfc2445Date(until, "/");
        var user=window.localStorage.userAuth;
        $.ajax({
            url:connectURL.baseURL+connectURL.updateTask,
            dataType:'json',
            type:'POST',
            data:{
                icalUID:icalUID,
                userauth:user,
                title:eventTitle,
                content:eventContent,
                dtstart:startDate,
                dtend:endDate,
                freq:freq,
                byday:byday,
                until:until
            },
            success:function(res){
                handler(res);
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){

            }
        })
    }
}

