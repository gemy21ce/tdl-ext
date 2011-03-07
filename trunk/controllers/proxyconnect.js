/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var connectURL={
//        baseURL:'http://192.168.1.155:8080/CalendarProxy',
        baseURL:'http://todolist.activedd.com',
    //baseURL:'http://localhost:8084/cp',
    checkCred:'/proxy/checkcred.htm',
    postEvent:'/proxy/createtask.htm'
}
var proxy={
    checkCridentials:function(username,password,successhandler,failerhandler){
        $.ajax({
            url:connectURL.baseURL+connectURL.checkCred,
            type:'POST',
            data:{
                username:username,
                password:password
            },
            success:function(resp){
                if(resp=='VALIDUSER'){
                    successhandler();
                }else{
                    failerhandler();
                }
            }
        })
    },
    saveTask:function(eventTitle,eventContent,startDate,endDate,byday,freq,until,id,handler){
        if(! window.localStorage.user){
            return;
        }
        byday=util.dayInWeek(startDate);
        startDate=util.icalrfc2445Date(startDate,"/");
        endDate=util.icalrfc2445Date(endDate,"/");
        until=util.icalrfc2445Date(until, "/");
        var user=JSON.parse(window.localStorage.user);
        $.ajax({
            url:connectURL.baseURL+connectURL.postEvent,
            dataType:'json',
            type:'POST',
            data:{
                id:id,
                username:user.username,
                password:user.password,
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

