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
                "startdate string,time string, enddate string, reminder string, priority string, expired boolean);",
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
    save: function(task, handler) {
        this.db.transaction(function(tx) {
            tx.executeSql("insert into tasklist (title, content, startdate,time, enddate, reminder, priority, expired) values (?,?,?,?,?,?,?,?);",
                [task.title,task.content,task.startdate,task.time,task.enddate,task.reminder,task.priority,task.expired],
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
    addreminder:function(task,start,time,until,type,handler){
        //to be checked later
        this.db.transaction(function(tx) {
            tx.executeSql("insert into reminder (taskid, date,time) values (?,?,?);",
                [task,start,time],
                handler,
                tododb.onError);
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
    deleteRec:function(taskid,handler){
        this.db.transaction(function(tx) {
            tx.executeSql("DELETE FROM tasklist WHERE id=?;",
                [taskid],
                handler,
                tododb.onError);
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
            tx.executeSql("SELECT * FROM tasklist WHERE startdate < ?;",
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
            tx.executeSql("SELECT * FROM tasklist WHERE startdate < ? and expired=?;",
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
    }
}
tododb.setup();
