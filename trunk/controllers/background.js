/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
//var todaysReminders=[];
var bg={
    todaysReminders:[],
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
            alert(JSON.stringify(bg.todaysReminders))
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
    bg.checkTodaysReminders();
    window.setInterval("bg.checkTodaysReminders()",1000 * 60 * 60 * 24);
    bg.backgroundAlert();

});

