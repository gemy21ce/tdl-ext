/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var POPUP={
    init:function(){
        $(".toggle_container").hide();
        POPUP.triggerTasks('todaytasks');
        $("#todays").show();
        POPUP.openFolds();
    },
    populateInRows:function(list,tableId){
        var out='';
        for(var i=0 ;i< list.length; i++){
            out+='<tr>';
            out+='<td width="25" height="26" align="center"><input name="" type="checkbox" value="'+list[i].id+'" /></td>';
            out+='<td width="100" height="26"onclick="POPUP.editTask('+list[i].id+')" style="cursor:pointer;">'+list[i].title+'</td>';
            out+='<td width="80" height="26" align="center">'+list[i].time+'</td>';
            out+='<td width="185" height="26">'+util.cutText(list[i].content, 20)+'</td>';
            out+='<td width="100" height="26">'+list[i].startdate+'</td>';
            out+='<td width="25" height="26" align="center"><a onclick="POPUP.editTask('+list[i].id+')" style="cursor:pointer;"><img src="images/edit.png" width="19" height="22" alt="edit" /></a></td>';
            out+='</tr>'
        }
        $("#"+tableId).html(out);
        POPUP.highlightChecked();
    },
    triggerTasks:function(day){
        switch (day){
            case 'todaytasks':{
                tododb.todayLists(function(list){
                    POPUP.populateInRows(list, 'todaysTable');
                });
                break;
            }
            case 'tomorrowtasks':{
                tododb.tomorrowLists(function(list){
                    POPUP.populateInRows(list, 'tomorrowsTable');
                });
                break;
            }
            case 'oldtasks':{
                tododb.getOldTasks(function(list){
                    POPUP.populateInRows(list, 'oldTaskTable');
                });
                break;
            }
            case 'upcommingtasks':{
                tododb.getUpcommingTasks(function(list){
                    POPUP.populateInRows(list, 'upcommingTable');
                });
                break;
            }
            case 'undatedtasks':{
                tododb.getNodatedTasks(function(list){
                    POPUP.populateInRows(list, 'undatedtasksTable');
                });
                break;
            }
        }
    },
    OpenOptionPage:function(){
        var url=chrome.extension.getURL("/views/options.html")
        chrome.tabs.create({
            url:url
        });
    },
    OpenAddForm:function(){
        $("#completedcheck").hide();
        $("#updateTask").hide();
        $("#addEvent").show();
        $("#main-page").hide();
        $("#add-container").show();
    },
    backToMain:function(){
        $("#main-page").show();
        $("#add-container").hide();
        document.addForm.reset();
    },
    addNewTask:function(task){
        tododb.save(task, function(){
            POPUP.backToMain();
            POPUP.init();
            var sync=JSON.parse(window.localStorage.synchsettings);
            if(sync.settings == 'all' || sybc.settings == task.priority){
                chrome.extension.getBackgroundPage().proxy.saveTask(task.title, task.content, task.startdate, task.startdate, '', task.reminderType, task.until, function(){});
            }
        });
    },
    validate:function(){
        var task={
            title:$('#taskTitle').attr('value'),
            content:$('#content').attr('value'),
            startdate:$('#startdate').attr('value'),
            time:$('#time').attr('value'),
            enddate:'',
            reminder:$('#reminder').attr('value'),
            priority:$('#priority').attr('value'),
            expired:false,
            reminderType:$("#reminderType").attr('value'),
            until:$("#until").attr('value')
        }
        if(task.title == '' ){
            POPUP.showError('\u0628\u0639\u0636 \u0627\u0644\u062d\u0642\u0648\u0644 \u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0645\u0643\u062a\u0645\u0644\u0629');
            POPUP.calledRed('required', 2000);
            return;
        }
        if((task.startdate != '')&&(task.startdate < util.today())){
            POPUP.showError('\u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0636\u0627\u0641\u0629 \u0645\u0647\u0645\u0629 \u0641\u064a \u064a\u0648\u0645 \u0633\u0627\u0628\u0642');
            return;
        }
        if((task.time != '')&&(task.startdate == util.today() && task.time < util.now())){
            POPUP.showError('\u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0636\u0627\u0641\u0629 \u0645\u0647\u0645\u0629 \u0641\u064a \u064a\u0648\u0645 \u0633\u0627\u0628\u0642');
            return;
        }
        switch(task.reminderType){
            case '':{
                POPUP.addNewTask(task);
                break;
            }
            case 'none':{
                POPUP.addNewTask(task);
                tododb.lastAdd(function(id){
                    tododb.addreminder(id.id, task.startdate, task.reminder, function(){});
                    chrome.extension.getBackgroundPage().bg.checkTodaysReminders();
                });
                break;
            }
            case 'daily':{
                POPUP.addNewTask(task);
                tododb.lastAdd(function(id){
                    var untilDate=util.Date(task.until);
                    var nextDay=util.Date(task.startdate);
                    while(nextDay.getTime() != untilDate.getTime()){
                        tododb.addreminder(id.id, util.dateString(nextDay), task.reminder, function(){});
                        nextDay=util.nextDay(nextDay);
                    }
                    chrome.extension.getBackgroundPage().bg.checkTodaysReminders();
                });
                break;
            }
            case 'weekly':{
                POPUP.addNewTask(task);
                tododb.lastAdd(function(id){
                    var untilDate=util.Date(task.until);
                    var nextDay=util.Date(task.startdate);
                    while(nextDay.getTime() != untilDate.getTime()){
                        tododb.addreminder(id.id, util.dateString(nextDay), task.reminder, function(){});
                        nextDay=util.nextWeek(nextDay);
                    }
                    chrome.extension.getBackgroundPage().bg.checkTodaysReminders();
                });
                break;
            }
            case 'monthly':{
                POPUP.addNewTask(task);
                tododb.lastAdd(function(id){
                    var untilDate=util.Date(task.until);
                    var nextDay=util.Date(task.startdate);
                    while(nextDay.getTime() != untilDate.getTime()){
                        tododb.addreminder(id.id, util.dateString(nextDay), task.reminder, function(){});
                        nextDay=util.nextMonth(nextDay);
                    }
                    chrome.extension.getBackgroundPage().bg.checkTodaysReminders();
                });
                break;
            }
            case 'yearly':{
                POPUP.addNewTask(task);
                tododb.lastAdd(function(id){
                    var untilDate=util.Date(task.until);
                    var nextDay=util.Date(task.startdate);
                    while(nextDay.getTime() != untilDate.getTime()){
                        tododb.addreminder(id.id, util.dateString(nextDay), task.reminder, function(){});
                        nextDay=util.nextYear(nextDay);
                    }
                    chrome.extension.getBackgroundPage().bg.checkTodaysReminders();
                });
                break;
            }
            default:{
                POPUP.addNewTask(task);
            }
        }
        
    },
    showError:function(msg){
        $('#errorMSG').html(msg);
        $('#AlertBox').show('fast');
        setTimeout('POPUP.hideErrorBox();',2000);
    },
    hideErrorBox:function(){
        $("#AlertBox").hide('slow');
    },
    calledRed:function(className,timeInMillisecund){
        $('.'+className).addClass('required-field');
        setTimeout("$('.'+'"+className+"').removeClass('required-field');",timeInMillisecund);
    },
    deleteRows:function(){
        var rows=util.selectedRows();
        if(rows.length ==0){
            POPUP.showError('\u0644\u0645 \u062a\u062e\u062a\u0631 \u0623\u064a \u0645\u0647\u0645\u0629 \u0644\u062d\u0630\u0641\u0647\u0627');
            return;
        }
        for(i in rows){
            tododb.deleteRec(rows[i], function(){
                POPUP.init();
            });
        }
    },
    editTask:function(id){
        tododb.getTaskById(id, function(task){
            $('#taskId').attr('value',task.id);
            $('#taskTitle').attr('value',task.title);
            $('#content').attr('value',task.content);
            $('#startdate').attr('value',task.startdate);
            $('#time').attr('value',task.time);
            $('#reminder').attr('value',task.reminder);
            $('#priority').attr('value',task.priority);
            if(task.expired=='true'){
                document.getElementById('completedTask').checked=true
            }
            POPUP.OpenAddForm();
            $("#completedcheck").show();
            $("#updateTask").show();
            $("#addEvent").hide();
        })
    },
    updateTask:function(){
        var task={
            id:$('#taskId').attr('value'),
            title:$('#taskTitle').attr('value'),
            content:$('#content').attr('value'),
            startdate:$('#startdate').attr('value'),
            time:$('#time').attr('value'),
            enddate:'',
            reminder:$('#reminder').attr('value'),
            priority:$('#priority').attr('value'),
            expired:$('#completedTask').attr('checked')
        }
        if(task.title == ''){
            POPUP.showError('\u0628\u0639\u0636 \u0627\u0644\u062d\u0642\u0648\u0644 \u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0645\u0643\u062a\u0645\u0644\u0629');
            POPUP.calledRed('required', 2000);
            return;
        }
        if((task.startdate != '')&&(task.startdate < util.today())){
            POPUP.showError('\u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0636\u0627\u0641\u0629 \u0645\u0647\u0645\u0629 \u0641\u064a \u064a\u0648\u0645 \u0633\u0627\u0628\u0642');
            return;
        }
        if((task.time != '')&&(task.startdate == util.today() && task.time < util.now())){
            POPUP.showError('\u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0636\u0627\u0641\u0629 \u0645\u0647\u0645\u0629 \u0641\u064a \u064a\u0648\u0645 \u0633\u0627\u0628\u0642');
            return;
        }
        tododb.update(task, function(){
            POPUP.init();
            POPUP.backToMain();
        })

    },
    highlightChecked:function(){
        $(':checkbox').click(function(){
            if(this.checked){
                $(this.parentNode.parentNode).addClass('active-row');
            }else{
                $(this.parentNode.parentNode).removeClass('active-row');
            }
        });
    },
    openFolds:function(){
        tododb.tomorrowLists(function(list){
            if(list.length > 0){
                $("#div_tomorrowtasks").show();
            }else{
                $("#div_tomorrowtasks").hide();
            }
        });
        tododb.getOldTasks(function(list){
            if(list.length > 0){
                $("#div_oldtasks").show();
            }else{
                $("#div_oldtasks").hide();
            }
        });
        tododb.getUpcommingTasks(function(list){
            if(list.length > 0){
                $("#div_upcommingtasks").show();
            }else{
                $("#div_upcommingtasks").hide();
            }
        });
        tododb.getNodatedTasks(function(list){
            if(list.length > 0){
                $("#div_undatedtasks").show();
            }else{
                $("#div_undatedtasks").hide();
            }
        });
    }
}
$(function(){

    $("h2.trigger").click(function(){
        $("h2.trigger").removeClass('active');
        $(this).addClass("active");
    });

    $("h2.trigger").click(function(){
        POPUP.triggerTasks(this.id);
        $(".toggle_container").hide();
        $(this).next(".toggle_container").slideToggle("slow,");
    });

    $("div.options").click(function () {
        $("div.menu").slideToggle("slow");
    });
    //--
    //add page
    $("div.date-options").click(function () {
        $("div.date-menu").slideToggle("slow");

    });
    $("div.time-options").click(function () {
        $("div.time-menu").slideToggle("slow");

    });
    $("div.repeat-options").click(function () {
        $("div.repeat-menu").slideToggle("slow");

    });
    //--
    //date time picker
    $("#startdate,#until").datepicker({
        dateFormat:'dd/mm/yy'
    });
    //    $("#until").datepicker({
    //        dateFormat:'dd/mm/yy'
    //    });
    $("#time,#reminder").timepicker({
        ampm:true
    });

    //--click  stuff
    $('#optionPage').click(function(){
        POPUP.OpenOptionPage();
    });
    $("#addbutton").click(function(){
        POPUP.OpenAddForm();
    });
    $("#close-addForm").click(function(){
        POPUP.backToMain();
    });
    $("#closeAlertBox").click(function(){
        POPUP.hideErrorBox();
    });
    $("#addEvent").click(function(){
        POPUP.validate();
    });
    $("#deletebutton").click(function(){
        POPUP.deleteRows();
    });
    $("#updateTask").click(function(){
        POPUP.updateTask();
    });
    $('select#reminderType').selectmenu({
        maxHeight: 550
    });
    $('select#priority').selectmenu({
        maxHeight: 550
    });
    $("#allOldTasks").click(function(){
        tododb.getOldTasks(function(list){
            POPUP.populateInRows(list, 'oldTaskTable');
        });
    });
    $("#completedOldTasks").click(function(){
        tododb.completedOldTasks(function(list){
            POPUP.populateInRows(list, 'oldTaskTable');
        },true);
    });
    $("#uncompletedOldTasks").click(function(){
        tododb.completedOldTasks(function(list){
            POPUP.populateInRows(list, 'oldTaskTable');
        },false);
    });
    //--

    POPUP.init();
});

//tododb.drop()