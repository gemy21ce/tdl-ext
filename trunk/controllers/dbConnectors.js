/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var tododb={
    setup:function(){
        this.db = openDatabase('todolist', '1.0', 'To do list extension database',  5*1024*1024);
        this.db.transaction(function(tx) {
            tx.executeSql("create table if not exists " +
                "tasklist(id integer primary key asc, title string, content string,"+
                "startdate string,time string, enddate string, reminder string, priority string, expired boolean, gcalurl string);",
                [],
                function() {
                    console.log("tasklist created");
                }
                );
        });
        this.db.transaction(function(tx) {
            tx.executeSql("create table if not exists " +
                "reminder(id integer primary key asc, taskid string, date string,time string);",
                [],
                function() {
                    console.log("reminder created");
                }
                );
        });
    },
    save:function(task, handler) {
        this.db.transaction(function(tx) {
            tx.executeSql("insert into tasklist (title, content, startdate,time, enddate, reminder, priority, expired, gcalurl) values (?,?,?,?,?,?,?,?,?);",
                [task.title,task.content,task.startdate,task.time,task.enddate,task.reminder,task.priority,task.expired,''],
                function(){
                    tododb.lastAdd(function(id){
                        var untilDate=util.Date(task.until);
                        var nextDay=util.Date(task.startdate);
                        var dates=[];
                        switch(task.reminderType){
                            case 'none':{
                                if(task.reminder && task.reminder != ''){
                                    tododb.addReminders(id, [util.dateString(nextDay)], task.reminder, function(){
                                        chrome.extension.getBackgroundPage().bg.checkTodaysReminders();
                                    });
                                }
                                break;
                            }
                            case 'daily':{
                                while(nextDay.getTime() != untilDate.getTime()){
                                    dates.push(util.dateString(nextDay));
                                    nextDay=util.nextDay(nextDay);
                                }
                                tododb.addReminders(id, dates, task.reminder, function(){
                                    chrome.extension.getBackgroundPage().bg.checkTodaysReminders();
                                });
                                break;
                            }
                            case 'weekly':{
                                while(nextDay.getTime() <= untilDate.getTime()){
                                    dates.push(util.dateString(nextDay));
                                    nextDay=util.nextWeek(nextDay);
                                }
                                tododb.addReminders(id, dates, task.reminder, function(){
                                    chrome.extension.getBackgroundPage().bg.checkTodaysReminders();
                                });
                                break;
                            }
                            case 'monthly':{
                                while(nextDay.getTime() <= untilDate.getTime()){
                                    dates.push(util.dateString(nextDay));
                                    nextDay=util.nextMonth(nextDay);
                                }
                                tododb.addReminders(id, dates, task.reminder, function(){
                                    chrome.extension.getBackgroundPage().bg.checkTodaysReminders();
                                });
                                break;
                            }
                            case 'yearly':{
                                while(nextDay.getTime() <= untilDate.getTime()){
                                    dates.push(util.dateString(nextDay));
                                    nextDay=util.nextYear(nextDay);
                                }
                                tododb.addReminders(id, dates, task.reminder, function(){
                                    chrome.extension.getBackgroundPage().bg.checkTodaysReminders();
                                });
                                break;
                            }
                            default:{
                                break;
                            }
                        }
                        handler(id);
                    });
                },
                tododb.onError);
        });//
    },
    lastAdd:function(handler){
        var matchingTasks=[];
        this.db.transaction(function(tx) {
            tx.executeSql("SELECT max (id) as id FROM  tasklist ;",
                [],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        matchingTasks.push(util.clone(results.rows.item(i)));
                    }
                    handler(matchingTasks[0].id);
                },
                tododb.onError);
        });
    },
    setGoogleCalendarURL:function(taskId,gcurl,handler){
        this.db.transaction(function(tx) {
            tx.executeSql("UPDATE tasklist set gcalurl= ? WHERE id= ?;",
                [gcurl,taskId],
                handler,
                tododb.onError);
        });
    },
    drop:function(table){
        this.db.transaction(function(tx) {
            tx.executeSql("drop table "+table+";",
                [],
                function() {
                    console.log("dropped");
                }
                );
        });
    },
    addreminder:function(task,date,time,handler){
        this.db.transaction(function(tx) {
            tx.executeSql("insert into reminder (taskid, date,time) values (?,?,?);",
                [task,date,time],
                handler,
                tododb.onError);
        });
    },
    addReminders:function(taskid,dates,time,handler){
        this.db.transaction(function(tx) {
            for(i=0 ; i < dates.length; i++){
                tx.executeSql("insert into reminder (taskid, date,time) values (?,?,?)",
                    [taskid,dates[i],time],
                    (i==dates.length-1?handler:null),
                    tododb.onError);
            }
        });
    },
    update:function(task,handler){
        this.db.transaction(function(tx) {
            tx.executeSql("UPDATE tasklist set title=? ,content=? ,startdate=?, time=? ,enddate=? ,reminder=?  ,priority=? ,expired=? WHERE id= ?;",
                [task.title,task.content,task.startdate,task.time,task.enddate,task.reminder,task.priority,task.expired,task.id],
                handler,
                tododb.onError);
        });
    },
    deleteRec:function(taskids,handler){
        this.db.transaction(function(tx) {
            for(var i=0;i<taskids.length;i++){
                tx.executeSql("DELETE FROM tasklist WHERE id=?;",
                    [taskids[i]],
                    null,
                    tododb.onError);
                tx.executeSql("DELETE FROM reminder WHERE taskid=?;",
                    [taskids[i]],
                    (i==taskids.length-1?handler:null),
                    tododb.onError);
            }
        });
    },
    markAsDone:function(ids,handler){
        this.db.transaction(function(tx) {
            for(var i=0;i<ids.length;i++){
                tx.executeSql("UPDATE tasklist set expired= ? WHERE id= ?;",
                    [true,ids[i]],
                    null,
                    tododb.onError);
                tx.executeSql("DELETE FROM reminder WHERE taskid=?;",
                    [ids[i]],
                    (i==ids.length-1?handler:null),
                    tododb.onError);
            }
            
        });
    },
    searchByTitle:function(title,handler){
        var matchingTasks=[];
        this.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM tasklist WHERE title like(?);",
                ['%'+title+'%'],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        matchingTasks.push(util.clone(results.rows.item(i)));
                    }
                    handler(matchingTasks);
                },
                tododb.onError);
        });
    },
    searchByStartDate:function(date,handler){
        var matchingTasks=[];
        this.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM tasklist WHERE startdate like(?);",
                ['%'+date+'%'],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        matchingTasks.push(util.clone(results.rows.item(i)));
                    }
                    handler(matchingTasks);
                },
                tododb.onError);
        });
    },
    getOldTasks:function(handler){
        var date=util.today();
        var matchingTasks=[];
        this.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM tasklist WHERE startdate < ? AND startdate != '';",
                [date],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        matchingTasks.push(util.clone(results.rows.item(i)));
                    }
                    handler(matchingTasks);
                },
                tododb.onError);
        });
    },
    completedOldTasks:function(handler,completed){
        var date=util.today();
        var matchingTasks=[];
        this.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM tasklist WHERE startdate < ? AND expired=? AND startdate != '';",
                [date,completed],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        matchingTasks.push(util.clone(results.rows.item(i)));
                    }
                    handler(matchingTasks);
                },
                tododb.onError);
        });
    },
    getUpcommingTasks:function(handler){
        var date=util.tomorrow();
        var matchingTasks=[];
        this.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM tasklist WHERE startdate > ?;",
                [date],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        matchingTasks.push(util.clone(results.rows.item(i)));
                    }
                    handler(matchingTasks);
                },
                tododb.onError);
        });
    },
    getNodatedTasks:function(handler){
        var matchingTasks=[];
        this.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM tasklist WHERE startdate == '' ;",
                [],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        matchingTasks.push(util.clone(results.rows.item(i)));
                    }
                    handler(matchingTasks);
                },
                tododb.onError);
        });
    },
    getTaskById:function(id,handler){
        var matchingTasks=[];
        this.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM tasklist WHERE id = ?;",
                [id],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        matchingTasks.push(util.clone(results.rows.item(i)));
                    }
                    handler(matchingTasks.length == 0?null:matchingTasks[0]);
                },
                tododb.onError);
        });
    },
    todayLists:function(handler){
        var todaystring=util.today();
        tododb.searchByStartDate(todaystring, handler);
    },
    tomorrowLists:function(handler){
        var tomorrowstring=util.tomorrow();
        tododb.searchByStartDate(tomorrowstring, handler);
    },
    onError: function(tx,error) {
        console.log("Error occurred: ", error.message);
    },
    todaysReminders:function(handler){
        var todaystring=util.today();
        var matchingTasks=[];
        this.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM reminder WHERE date = ? ;",
                [todaystring],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        matchingTasks.push(util.clone(results.rows.item(i)));
                    }
                    handler(matchingTasks);
                },
                tododb.onError);
        });
    },
    deleteReminder:function(id,handler){
        this.db.transaction(function(tx) {
            tx.executeSql("DELETE FROM reminder WHERE id=?;",
                [id],
                handler,
                tododb.onError);
        });
    }
}
tododb.setup();
