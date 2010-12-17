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
    },
    selectedRows:function(){
        var checked=[];
        $(':checkbox').each(function(){
            if(this.checked){
                checked.push(this.value);
            }
        });
        return checked;
    }
}

