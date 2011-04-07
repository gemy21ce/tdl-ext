/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
//var todaysReminders=[];
var bg={
    todaysReminders:[],
    setup:function(){
        tododb.setup();
        if(! window.localStorage.synchsettings){
            window.localStorage.synchsettings=JSON.stringify({
                settings:['all']
                });
        }
    },
    fireNotificationAlarm:function(title,msg){
        var notification = webkitNotifications.createNotification(
            'images/bell.jpg',  // icon url - can be relative
            title,  // notification title
            (msg?msg:'') // notification body text
            );
        notification.show();
    },
    checkTodaysReminders:function(){
        tododb.todaysReminders(function(list){
            bg.todaysReminders=list;
        });
    },
    backgroundAlert:function(){
        var now=util.now();
        for(var i=0; i< bg.todaysReminders.length; i++){
            if(bg.todaysReminders[i].time == now){
                tododb.getTaskById(bg.todaysReminders[i].taskid, function(task){
                    bg.fireNotificationAlarm(task.title,task.content);
                });
                tododb.deleteReminder(bg.todaysReminders[i].id,null);
            }
        }
        window.setTimeout("bg.backgroundAlert()",1000 * 60);
    }
}
$(function(){
    bg.setup();
    bg.checkTodaysReminders();
    window.setInterval("bg.checkTodaysReminders()",1000 * 60 * 60 * 24);
    bg.backgroundAlert();

});

/**
 * Handles data sent via chrome.extension.sendRequest().
 * @param request Object Data sent in the request.
 * @param sender Object Origin of the request.
 * @param callback Function The method to call when the request completes.
 */
function onRequest(request, sender, callback) {
    if(request.action=='synchTOGCAL'){
        var task=request.data;
        proxy.saveTask(task.title, task.content, task.startdate, task.startdate, '', task.reminderType, task.until,request.id, function(res){
            tododb.setGoogleCalendarURL(res.id, res.gcurl, function(){});
        });
    }
    if(request.action == 'updateTask'){
        var task=request.data;
        proxy.updateTask(task.old.gcalurl,task.title, task.content, task.startdate, task.startdate, '', task.reminderType, task.until,task.old.title,task.old.startdate, function(){});
    }
}

// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);