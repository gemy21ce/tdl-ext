/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var connectURL={
    baseURL:'http://localhost:8084/cp',
    checkCred:'/proxy/checkcred.htm',
    postEvent:'proxy/createtask.htm'
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
    saveTask:function(eventTitle,eventContent,startDate,endDate,byday,freq,until,handler){
        $.ajax({
            url:connectURL.postEvent,
            type:'POST',
            data:{
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
            }
        })
    }
}

