/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var POPUP={
    init:function(){
        POPUP.triggerTasks('todaytasks');
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
		$('select#reminderType').selectmenu({maxHeight: 550});
		$('select#priorityType').selectmenu({maxHeight: 550});
		
		

    },
    populateInRows:function(list,tableId){
        var out='';
        for(var i=0 ;i< list.length; i++){
            out+='<tr>';
            out+='<td width="25" height="26" align="center"><input name="" type="checkbox" value="'+list[i].id+'" /></td>';
            out+='<td width="100" height="26">'+list[i].title+'</td>';
            out+='<td width="80" height="26" align="center">'+list[i].time+'</td>';
            out+='<td width="185" height="26">'+list[i].content+'</td>';
            out+='<td width="25" height="26" align="center"><a onclick="POPUP.editTask('+list[i].id+')" style="cursor:pointer;"><img src="images/edit.png" width="19" height="22" alt="edit" /></a></td>';
            out+='</tr>'
        }
        $("#"+tableId).html(out);
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
                })
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
            expired:false
        }
        if(task.title == '' && task.startdate == '' && task.time == ''){
            POPUP.showError('بعض الحقول يجب أن تكون مكتملة');
            POPUP.calledRed('required', 2000);
            return;
        }
        POPUP.addNewTask(task);
        POPUP.triggerTasks('todaytasks');
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
    selectedRows:function(){
        var checked=[];
        $(':checkbox').each(function(){
            if(this.checked){
                checked.push(this.value);
            }
        });
        return checked;
    },
    deleteRows:function(){
        var rows=POPUP.selectedRows();
        if(rows.length ==0){
            POPUP.showError('يجب أن تختار المهام المراد حذفها');
            return;
        }
        for(i in rows){
            tododb.deleteRec(rows[i], function(){
                POPUP.triggerTasks('todaytasks');
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
            $('#completedTask').attr('checked',task.expired);
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
            expired:$('#completedTask').attr('value')
        }
        if(task.title == '' && task.startdate == '' && task.time == ''){
            POPUP.showError('بعض الحقول يجب أن تكون مكتملة');
            POPUP.calledRed('required', 2000);
            return;
        }
        tododb.update(task, function(){
            POPUP.triggerTasks('todaytasks');
            POPUP.backToMain();
        })

    }
}
$(function(){

    //default popup page
    $(".toggle_container").hide();

    $("h2.trigger").toggle(function(){
        $(this).addClass("active");
    }, function () {
        $(this).removeClass("active");
    });

    $("h2.trigger").click(function(){
        POPUP.triggerTasks(this.id);
        $(".toggle_container").hide();
        $(this).next(".toggle_container").slideToggle("slow,");
    });

    $("div.options").click(function () {
        $("div.menu").slideToggle("slow");
    });
    $("#todays").show();
    //--
    //add page
    $("div.options").click(function () {
        $("div.menu").slideToggle("slow");

    });
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
    $("#startdate").datepicker({
        dateFormat:'dd/mm/yy'
    });
    $("#time,#reminder").timepicker({
        ampm:true
    });

    //--
    POPUP.init();
});

//tododb.drop()