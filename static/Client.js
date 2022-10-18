
var socket = io.connect();
socket.on('connect',function(){
    socket.emit('message','I am connected');
});
var global_tst = {}
class communicator{
    constructor(){
    }
    send(){

    };
    listen(){
        socket.on('machinHistory',function(data){
            console.log(data);
            $(".Date").hide()
            $(".line").hide();
            draw_History(data);
            $("#Line5").show();

        })
        socket.on('bootData',function(dataStream){
            $(".box").remove();
            $(".line").show();
            $(".Date").show();
            $("#Line4").hide();
            $("#Line5").hide();
            $("#Rewind").remove();

            global_tst = dataStream;
            total_draw(dataStream);
        });


        socket.on('updateState',function(data){
            //console.log("udate SOcket Came")
            let i = data['line']
            let x = data['row']
            if (data['state']==false){
                display_red(i,x);
            }
            else{
                if(data['state']==true){
                    display_green(i,x);
                }
                else{
                    if (data['Procedure']==true){
                        display_grey(i,x);
                    }
                    else{
                        display_disabled(i,x);
                    }
                }
                try{
                    setupNoteBehav(dataStream[i+','+x]['Note'],i,x,data['state'],data['Procedure']);
                }
                catch{}
            }
        });
        
        socket.on('updateNote',function(data){
            //console.log('updating Note')
            let i = data['line'];
            let x = data['row'];
            document.getElementById("note"+i+x).innerHTML=data['content'];
            try{
                setupNoteBehav(data['content'],i,x,data['state'],data['Procedure']);
            }
            catch{}
        })

        socket.on("datelist",function(data){
            $("#Rewind").remove();
            $(".line").hide();
            $(".Date").hide();
            for(let i = 0 ; i<data.length;i++ ){
                var dateBox = document.createElement("div");
                dateBox.setAttribute("class","Datelist")
                dateBox.setAttribute("id",data[i])

                dateBox.innerHTML = data[i];
                document.getElementById("Line4").appendChild(dateBox);
                $("#"+data[i]).click(function(){
                    socket.emit("updateFromDate",data[i]);
                    $(".Datelist").remove();
                    $(".box").remove();
                    document.getElementById("headDate").innerHTML = data[i];

                });
            }
            $("#Line4").show();
            console.log(data);
        })




        $(document).keypress(function(e) {
            if(e.which == 13) {
                if (document.activeElement.className=="note"){
                    socket.emit("updateNote",{'content':document.activeElement.innerHTML,'line':document.activeElement.attributes.line.value,'row':document.activeElement.attributes.row.value});
                    if(document.activeElement.innerHTML.length > 0){
                        let i = parseInt(document.activeElement.attributes.line.value);
                        let x = parseInt(document.activeElement.attributes.row.value);
                        let reference = document.getElementById("machineName"+i+x).innerHTML;
                        $("#PF"+i+x).trigger("click");                    }
                }

                $('*').blur();
            }
        });

        $(".Date").click(function(){
            socket.emit("listDates");
        });


    };

    display_indiv(data){

    };
        
}
function draw_History(dataStream){
    document.getElementById("Line5").innerHTML = dataStream['Reference'];
    for (let x = 0;x < dataStream['count'];x++){
        var Rewind = document.createElement("div");
            Rewind.setAttribute("id","Rewind");

        var box = document.createElement("div")
            box.setAttribute('class','box');
            box.setAttribute('id',"box"+5+x);

            var mch_name = document.createElement("div");
            mch_name.setAttribute("class","machineName");
            mch_name.setAttribute("id","machineName"+5+x);

            mch_name.innerHTML = dataStream[x]['Date'];
            
  

            var signal = document.createElement("div");
            signal.setAttribute("class","signal");
            signal.setAttribute("id","signal"+5+x);



            var Note = document.createElement("div");
            Note.setAttribute("class","note");
            Note.setAttribute("id","note"+5+x);
            Note.setAttribute("row",x);

            
            try{
                Note.innerHTML = dataStream[x]['Note'];
                //console.log(Note.innerHTML);
                //console.log(typeof(Note.innerHTML));
            }
            catch{

            }
            //console.log(box);
            box.appendChild(signal);
            box.appendChild(mch_name);

            box.appendChild(Note);
            document.getElementById('Line'+5).appendChild(box);
            //REd and green UI
            try{
                //
                //console.log(dataStream[i+','+x]['State']);
                if(dataStream[x]['State']==false){
                    var red_alert = display_red(5,x,box);
                    box.appendChild(red_alert);

                }
                else
                if(dataStream[x]['State']==true){
                    var Checked = display_green(5,x,box);
                    box.appendChild(Checked);

                }
            }
            catch{

            }
            //Note on hover if not empty scale up
           // try{
             //   setupNoteBehav(dataStream[x]['Note'],5,x,dataStream[x]['State']);
           // }
            //catch{}
            try{setup_behavior(dataStream['Reference'],5,x,dataStream);}
            catch{}
    }
    document.body.appendChild(Rewind);
    $("#Rewind").click(function(){
        bootRequest();
    });

}

function total_draw(dataStream){
    for (let i = 1; i < 4 ; i ++){
        for (let x = 0;x < 14;x++){
            var box = document.createElement("div")
            box.setAttribute('class','box');
            box.setAttribute('id',"box"+i+x);

            var buttonhist = document.createElement("div");
            buttonhist.setAttribute("class","buttonHist");
            buttonhist.setAttribute("id","buttonHist"+i+x);

            var mch_name = document.createElement("div");
            mch_name.setAttribute("class","machineName");
            mch_name.setAttribute("id","machineName"+i+x);
            try{
                mch_name.innerHTML = dataStream[i+','+x]['Reference'];
            }
            catch{
                mch_name.innerHTML = "----";
            }

            var signal = document.createElement("div");
            signal.setAttribute("class","signal");
            signal.setAttribute("id","signal"+i+x);
            var Buttons = document.createElement("div");

            try{
                if(dataStream[i+','+x]['edit']==true){
                    var Okbutton = document.createElement("button");
                    Okbutton.setAttribute("class","okBut");
                    Okbutton.setAttribute("id","Ok"+i+x);
                    Okbutton.innerHTML = "Ok";
        
                    var Notbutton = document.createElement("button");
                    Notbutton.setAttribute("class","notBut");
                    Notbutton.setAttribute("id","notBut"+i+x);
                    Notbutton.innerHTML = "Not";
        
                    var PF = document.createElement("button");
                    PF.setAttribute("class","PF");
                    PF.setAttribute("id","PF"+i+x);
                    PF.innerHTML = "PF";
        

                    var MF = document.createElement("button");
                    MF.setAttribute("class","MF");
                    MF.setAttribute("id","MF"+i+x);
                    MF.innerHTML = "";


                    Buttons.setAttribute("class","buttons");
                    Buttons.setAttribute("id","buttons"+i+x);
        
                    Buttons.appendChild(Okbutton);
                    Buttons.appendChild(Notbutton);
                    Buttons.appendChild(PF);
                    Buttons.appendChild(MF);
                }
                 }
                catch{}




            var Note = document.createElement("div");
            Note.setAttribute("class","note");
            Note.setAttribute("id","note"+i+x);
            Note.setAttribute("line",i);
            Note.setAttribute("row",x);

            try{
            if(dataStream[i+','+x]['edit']==true){
                console.log(dataStream[i+','+x]['edit'])
                Note.setAttribute("contenteditable","true");
            }
             }
            catch{}
            
            try{
                Note.innerHTML = dataStream[i+','+x]['Note'];
                //console.log(Note.innerHTML);
                //console.log(typeof(Note.innerHTML));
            }
            catch{

            }
            //console.log(box);
            box.appendChild(buttonhist);
            box.appendChild(signal);
            box.appendChild(mch_name);

            box.appendChild(Note);
            box.appendChild(Buttons);
            document.getElementById('Line'+i).appendChild(box);
            //REd and green UI
            try{
                //
                //console.log(dataStream[i+','+x]['State']);
                if(dataStream[i+','+x]['State']==false){
                    var red_alert = display_red(i,x,box);
                    box.appendChild(red_alert);

                }
                else
                if(dataStream[i+','+x]['State']==true){
                    var Checked = display_green(i,x,box);
                    box.appendChild(Checked);
                }else{
                    if(dataStream[i+','+x]['Procedure']==false){
                        var Checked = display_disabled(i,x);
                        box.appendChild(Checked);
                    }
                    else{
                        var Checked = display_grey(i,x);
                        box.appendChild(Checked);
                    }

                }
            }
            catch{

            }
            //Note on hover if not empty scale up
            try{
                setupNoteBehav(dataStream[i+','+x]['Note'],i,x,dataStream[i+','+x]['State'],dataStream[i+','+x]['Procedure']);
            }
            catch{}
            try{setup_behavior(dataStream[i+','+x]['Reference'],i,x,dataStream);}
            catch{}
            //Loadhistory to Line 5 of History
            $("#buttonHist"+i+x).click(function(){
                socket.emit("machHistory",{'line':i,'row':x});
            });
        }
    }
}
function setup_behavior(reference,i,x,box,dataStream){
    $("#Ok"+i+x).click(function(){
        socket.emit("stateChange",{'state':true,'reference':reference,'line':i,'row':x,'Procedure':true});
        $("#note"+i+x).focus();

    });
    $("#notBut"+i+x).click(function(){
        socket.emit("stateChange",{'state':false,'reference':reference,'line':i,'row':x,'Procedure':true});
        $("#note"+i+x).focus();

    });

    $("#PF"+i+x).click(function(){
        socket.emit("stateChange",{'state':null,'reference':reference,'line':i,'row':x,'Procedure':true});
        $("#note"+i+x).focus();
    });

    $("#MF"+i+x).click(function(){
        socket.emit("stateChange",{'state':null,'reference':reference,'line':i,'row':x,'Procedure':false});
    });
}
function setupNoteBehav(Note,i,x,State,procedure){
    try{
        if (Note.length!=0){
            $("#box"+i+x).css("opacity","100%");

           $("#note"+i+x).on("mouseover",function(){
            $(this).css({transform:"scale(1.9)"});
            $(this).css({position:"relative"});
            $(this).css('z-index',"1");

            $(this).on("mouseleave",function(){
                $(this).css({transform:"scale(1)"})
                $("#machineName"+i+x).css({transform:"scale(1)"})
                $(this).css('z-index',0);
            });
           }) 
        }
        else{
            $("#note"+i+x).on("mouseover",function(){$(this).css({transform:"scale(1)"});})
        }
        if (State==true ){
            display_green(i,x);
        }
        if (State==null && procedure==true){
            display_grey(i,x);
        }
        else{
            if(procedure==false && State==null){
                display_disabled(i,x);
            }
        }
}
    catch{}
}

function display_red(i,x){

    $("#signal"+i+x).css("background-color","rgb(192, 80, 89)");  
    $("#box"+i+x).css("background-color","rgb(192, 80, 89)");  
    $("#box"+i+x).css("opacity","100%");

    $("#notBut"+i+x).css("opacity","100%");
    $("#Ok"+i+x).css("opacity","30%");
    $("#PF"+i+x).css("opacity","30%");
    $("#MF"+i+x).css("opacity","15%");

    
    $("#notBut"+i+x).css({transform:"scale(1)"});
    $("#Ok"+i+x).css({transform:"scale(0.7)"});
    $("#PF"+i+x).css({transform:"scale(0.7)"});
    $("#MF"+i+x).css({transform:"scale(0.7)"});


    //console.log("box"+i+x);  
    var red_alert = document.createElement("div");
    red_alert.setAttribute("class","Alert");
    red_alert.setAttribute("id","Warning"+i+x);

    return red_alert;
}
function display_grey(i,x){
    $("#box"+i+x).css("background-color","rgb(47, 61, 74)");  
    $("#signal"+i+x).css("opacity","0%");
    $("#box"+i+x).css("opacity","100%");

    $("#notBut"+i+x).css("opacity","30%");
    $("#Ok"+i+x).css("opacity","30%");
    $("#PF"+i+x).css("opacity","100%");
    $("#MF"+i+x).css("opacity","15%");

    
    $("#notBut"+i+x).css({transform:"scale(0.7)"});
    $("#Ok"+i+x).css({transform:"scale(0.7)"});
    $("#PF"+i+x).css({transform:"scale(1)"});
    $("#MF"+i+x).css({transform:"scale(0.7)"});

    if(document.getElementById("note"+i+x).innerHTML.length > 0){
        $("#signal"+i+x).css("background-color","rgb(153, 153, 0)");
        $("#box"+i+x).css("opacity","100%");
        $("#signal"+i+x).css("opacity","100%");

    }
}

function display_disabled(i,x){
    $("#box"+i+x).css("background-color","rgb(47, 61, 74)");  
    $("#signal"+i+x).css("opacity","0%");
    $("#box"+i+x).css("opacity","30%");

    $("#notBut"+i+x).css("opacity","30%");
    $("#Ok"+i+x).css("opacity","30%");
    $("#PF"+i+x).css("opacity","30%");
    $("#MF"+i+x).css("opacity","100%");

    
    $("#notBut"+i+x).css({transform:"scale(0.7)"});
    $("#Ok"+i+x).css({transform:"scale(0.7)"});
    $("#PF"+i+x).css({transform:"scale(0.7)"});
    $("#MF"+i+x).css({transform:"scale(1)"});

    if(document.getElementById("note"+i+x).innerHTML.length > 0){
        $("#signal"+i+x).css("background-color","rgb(153, 153, 0)");
        $("#box"+i+x).css("opacity","100%");
        $("#signal"+i+x).css("opacity","100%");

    }
}

function display_green(i,x){
    $("#box"+i+x).css("opacity","95%");
    $("#signal"+i+x).css("background-color","rgb(0, 102, 0)");
    $("#box"+i+x).css("background-color","rgb(0, 102, 0)");  

    $("#notBut"+i+x).css("opacity","30%");
    $("#Ok"+i+x).css("opacity","100%");
    $("#PF"+i+x).css("opacity","30%");
    $("#MF"+i+x).css("opacity","15%");


    $("#notBut"+i+x).css({transform:"scale(0.7)"});
    $("#Ok"+i+x).css({transform:"scale(1)"});
    $("#PF"+i+x).css({transform:"scale(0.7)"});
    $("#MF"+i+x).css({transform:"scale(0.7)"});



    if(document.getElementById("note"+i+x).innerHTML.length > 0){
        $("#signal"+i+x).css("background-color","rgb(153, 153, 0)");
    }

    //console.log("box"+i+x);
    var Checked = document.createElement("div");
    Checked.setAttribute("class","Alert");
    Checked.setAttribute("id","Warning"+i+x);
    
    $("#signal"+i+x).css("opacity","100%");

    return Checked;
}




function bootRequest(){
    socket.emit("bootRequest")
}

$(window).on('load',function() {
    comm = new communicator();
    comm.listen();
    bootRequest();
    
});