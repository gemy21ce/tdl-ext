/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var util={
    clone:function (o) { // shallow clone
        var clone = {};
        for (var key in o) {
            clone[key] = o[key];
        }
        return clone;
    },
    today:function(){
        var date=new Date();
        var todaystring=(date.getDate()>9?date.getDate():'0'+date.getDate())+'/'+((date.getMonth()+1)>9?(date.getMonth()+1):'0'+(date.getMonth()+1))+'/'+date.getFullYear();
        return todaystring;
    },
    tomorrow:function(){
        var date=new Date();
        var todaystring=((date.getDate()+1)>9?(date.getDate()+1):'0'+(date.getDate()+1))+'/'+((date.getMonth()+1)>9?(date.getMonth()+1):'0'+(date.getMonth()+1))+'/'+date.getFullYear();
        return todaystring;
    },
    now:function(){
        var date=new Date();
        var now=(date.getHours()%12 > 9 ? date.getHours()%12 : '0'+(date.getHours()%12))+':'+(date.getMinutes()>9?date.getMinutes():'0'+(date.getMinutes()))+' '+(date.getHours() > 12?'pm':'am');
        return now;
    },
    cutText:function(text,lenght){
        for( i =0 ; i< 20 ; i++){
            if(text.charAt( lenght) != " "){
                lenght++;
            }else{
                i=20;
            }
        }
        return text.substring(0, lenght)+" ...";
    }
}
var tododb={
    setup:function(){
        this.db = openDatabase('todolist', '1.0', 'To do list extension database',  5*1024*1024);
        this.db.transaction(function(tx) {
            tx.executeSql("create table if not exists " +
                "tasklist(id integer primary key asc, title string, content string,"+
                "startdate string,time string, enddate string, reminder string, priority string, expired boolean)",
                [],
                function() {
                    console.log("siucc");
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
    drop:function(){
        this.db.transaction(function(tx) {
            tx.executeSql("drop table tasklist;",
                [],
                function() {
                    console.log("dropped");
                }
                );
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
