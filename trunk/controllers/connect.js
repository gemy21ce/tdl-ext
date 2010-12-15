/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var connectURL={
    checkCred:'',
    postEvent:''
}
var connect={
    checkCridentials:function(username,password,successhandler,failerhandler){
        $.ajax({
            url:connectURL.checkCred,
            type:'POST',
            data:{
                usename:username,
                password:password
            },
            success:function(user){
                if(user==username){
                    successhandler();
                }else{
                    failerhandler();
                }
            }
        })
    },
    saveTask:function(eventTitle,eventContent,startDate,endDate,freq,until,handler){
        $.ajax({
            url:connectURL.postEvent,
            type:'POST',
            data:{title:eventTitle,content:eventContent,dtstart:startDate,dtend:endDate,freq:freq,until:until},
            success:function(res){
                handler(res);
            }
        })
    }
}

