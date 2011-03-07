/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var POPUP={
    init:function(){
        $(".toggle_container").hide();
        POPUP.triggerTasks(POPUP.getLastOpenedTab());
        $('#'+POPUP.getLastOpenedTab()).next(".toggle_container").slideToggle("fast");
        POPUP.openFolds();
    },
    populateInRows:function(list,tableId){
        if(list.length == 0){
            $("#"+tableId).html('<tr><td width="100%"><div class="no-tasks">'+'لا يوجد مهام لهذا اليوم'+'</div></td></tr>');
            //            $("#"+tableId).hide().parent().append('<div class="no-tasks">'+'لا يوجد مهام لهذا اليوم'+'</div>');
            return;
        }
        var out='';
        for(var i=0 ;i< list.length; i++){
            out+='<tr'+(list[i].expired=='true'?' class="completed" ':'')+'>';
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
        POPUP.setLastOpenedTab(day);
    },
    OpenOptionPage:function(){
        var url=chrome.extension.getURL("/views/options.html")
        chrome.tabs.create({
            url:url
        });
    },
    OpenAddForm:function(day){
        $("#completedcheck").hide();
        $("#updateTask").hide();
        $("#addEvent").show();
        $("#main-page").hide();
        $("#add-container").show();
        if(day){
            $("#startdate").attr('value',day);
        }
    },
    backToMain:function(){
        $("#add-container").hide();
        $("#main-page").show();
        document.addForm.reset();
    },
    addNewTask:function(task){
        tododb.save(task, function(id){
            POPUP.backToMain();
            POPUP.init();
            var sync=JSON.parse(window.localStorage.synchsettings);
            if(sync.settings == 'all' || sybc.settings == task.priority){
                proxy.saveTask(task.title, task.content, task.startdate, task.startdate, '', task.reminderType, task.until,id, function(res){
                    tododb.setGoogleCalendarURL(res.id, res.gcurl, function(){})
                });
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
        if((task.reminderType != 'none')&& (task.startdate == '')){
            POPUP.showError('\u064a\u062c\u0628 \u0623\u0646 \u062a\u0636\u064a\u0641 \u0648\u0642\u062a \u0648\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0645\u0647\u0645\u0629 \u062d\u062a\u064a \u064a\u062a\u0645 \u062a\u0643\u0631\u0627\u0631\u0647\u0627');
            return;
        }
        if((task.reminderType != 'none') && (task.until == '')){
            POPUP.showError('\u064a\u062c\u0628 \u0623\u0646 \u062a\u062d\u062f\u062f \u0645\u062a\u064a \u064a\u0646\u062a\u0647\u064a \u062a\u0643\u0631\u0627\u0631 \u0629لمهمة');
            return;
        }
        if((task.until != '')&&(task.startdate > task.until)){
            POPUP.showError('\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u062a\u0627\u0631\u064a\u062e \u062e\u0627\u0637\u0626 ل\u0627\u0646\u062a\u0647\u0627\u0621 \u0627\u0631تكرار');
            return;
        }
        POPUP.addNewTask(task);
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
            tododb.deleteRec(rows, function(){
                POPUP.init();
            });
    },
    markAsDone:function(){
        var rows=util.selectedRows();
        if(rows.length ==0){
            POPUP.showError('\u0644\u0645 \u064a\u062a\u0645 \u0625\u062e\u062a\u064a\u0627\u0631 \u0623\u064a \u0645\u0647\u0645\u0629');
            return;
        }
            tododb.markAsDone(rows, function(){
                POPUP.init();
            });
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
        if((task.startdate != '')&& (task.startdate == util.today() && task.time < util.now())){
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
    },
    setLastOpenedTab:function(tab){
        window.localStorage.lastOpened=JSON.stringify({
            tab:tab
        });
    },
    getLastOpenedTab:function(){
        if(! window.localStorage.lastOpened){
            POPUP.setLastOpenedTab('todaytasks');
        }
        return (JSON.parse(window.localStorage.lastOpened)).tab;
    },
    openTheme:function(){
        if(! window.localStorage.theme){
            return '';
        }
        var theme=JSON.parse(window.localStorage.theme);
        if(theme.url ==''){
            return '';
        }
        var out="<link href='";
        out+=theme.url;
        out+="' rel='stylesheet' type='text/css' />";
        return out;
    },
    addToToday:function(){
        POPUP.OpenAddForm(util.today());
    },
    addToTomorrow:function(){
        POPUP.OpenAddForm(util.tomorrow());
    }
}
$(function(){
    $('head').append(POPUP.openTheme());
    $("h2.trigger").click(function(){
        $("h2.trigger").removeClass('active');
        $(this).addClass("active");
    });

    $("h2.trigger").click(function(){
        POPUP.triggerTasks(this.id);
        $(".toggle_container").hide();
        $(this).next(".toggle_container").slideToggle("slow");
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
        dateFormat:'yy/mm/dd'
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
    $("#completedbutton").click(function(){
        POPUP.markAsDone();
    });
    $("#updateTask").click(function(){
        POPUP.updateTask();
    });
    /*$('select#reminderType').selectmenu({
        maxHeight: 550
    });*/
    /*$('select#priority').selectmenu({
        maxHeight: 550
    });*/
    //    $("#allOldTasks").click(function(){
    //        tododb.getOldTasks(function(list){
    //            POPUP.populateInRows(list, 'oldTaskTable');
    //        });
    //    });
    //    $("#completedOldTasks").click(function(){
    //        tododb.completedOldTasks(function(list){
    //            POPUP.populateInRows(list, 'oldTaskTable');
    //        },true);
    //    });
    //    $("#uncompletedOldTasks").click(function(){
    //        tododb.completedOldTasks(function(list){
    //            POPUP.populateInRows(list, 'oldTaskTable');
    //        },false);
    //    });
    $("#todayAdd").click(function(){
        POPUP.addToToday();
    });
    $("#tomorrowAdd").click(function(){
        POPUP.addToTomorrow();
    });
    $("#oldtaskselect").change(function(){
        switch (this.value){
            case'allOldTasks':{
                tododb.getOldTasks(function(list){
                    POPUP.populateInRows(list, 'oldTaskTable');
                });
                break;
            }
            case'completedOldTasks':{
                tododb.completedOldTasks(function(list){
                    POPUP.populateInRows(list, 'oldTaskTable');
                },true);
                break;
            }
            case'uncompletedOldTasks':{
                tododb.completedOldTasks(function(list){
                    POPUP.populateInRows(list, 'oldTaskTable');
                },false);
                break;
            }
        }
    });
    //--

    POPUP.init();
});

//tododb.drop()