
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
        socket.on('bootData',function(dataStream){
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
                display_green(i,x);
                try{
                    setupNoteBehav(dataStream[i+','+x]['Note'],i,x);
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
                setupNoteBehav(data['content'],i,x,data['state']);
            }
            catch{}
        })





        $(document).keypress(function(e) {
            if(e.which == 13) {
                if (document.activeElement.className=="note"){
                    socket.emit("updateNote",{'content':document.activeElement.innerHTML,'line':document.activeElement.attributes.line.value,'row':document.activeElement.attributes.row.value});
                }
                $('*').blur();
            }
        });
    };

    display_indiv(data){

    };
        
}


function total_draw(dataStream){
    for (let i = 1; i < 4 ; i ++){
        for (let x = 0;x < 14;x++){
            var box = document.createElement("div")
            box.setAttribute('class','box');
            box.setAttribute('id',"box"+i+x);

            var mch_name = document.createElement("div");
            mch_name.setAttribute("class","machineName");
            mch_name.setAttribute("id","machineName"+i+x);
            try{
                mch_name.innerHTML = dataStream[i+','+x]['Reference'];
            }
            catch{
                mch_name.innerHTML = "------";
            }

            var signal = document.createElement("div");
            signal.setAttribute("class","signal");
            signal.setAttribute("id","signal"+i+x);
            
            var Okbutton = document.createElement("button");
            Okbutton.setAttribute("class","okBut");
            Okbutton.setAttribute("id","Ok"+i+x);
            Okbutton.innerHTML = "Ok";

            var Notbutton = document.createElement("button");
            Notbutton.setAttribute("class","notBut");
            Notbutton.setAttribute("id","notBut"+i+x);
            Notbutton.innerHTML = "Not";


            var Buttons = document.createElement("div");
            Buttons.setAttribute("class","buttons");
            Buttons.setAttribute("id","buttons"+i+x);

            Buttons.appendChild(Okbutton);
            Buttons.appendChild(Notbutton);



            var Note = document.createElement("div");
            Note.setAttribute("class","note");
            Note.setAttribute("id","note"+i+x);
            Note.setAttribute("line",i);
            Note.setAttribute("row",x);
            Note.setAttribute("contenteditable","true");

            
            try{
                Note.innerHTML = dataStream[i+','+x]['Note'];
                //console.log(Note.innerHTML);
                //console.log(typeof(Note.innerHTML));
            }
            catch{

            }
            //console.log(box);
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

                }
            }
            catch{

            }
            //Note on hover if not empty scale up
            try{
                setupNoteBehav(dataStream[i+','+x]['Note'],i,x,dataStream[i+','+x]['State']);
            }
            catch{}
            try{setup_behavior(dataStream[i+','+x]['Reference'],i,x,dataStream);}
            catch{}


        }
    }
}
function setup_behavior(reference,i,x,box,dataStream){
    $("#Ok"+i+x).click(function(){
        socket.emit("stateChange",{'state':true,'reference':reference,'line':i,'row':x});
    });
    $("#notBut"+i+x).click(function(){
        socket.emit("stateChange",{'state':false,'reference':reference,'line':i,'row':x});
    });

}
function setupNoteBehav(Note,i,x,State){
    try{
        if (Note.length!=0){
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
            $("#signal"+i+x).css("background-color","rgb(153, 153, 0)");  
        if (State==true ){
            $("#signal"+i+x).css("background-color","rgb(153, 153, 0)");  
        }
}
    catch{}
}

function display_red(i,x){
    $("#signal"+i+x).css("background-color","rgb(192, 80, 89)");  
    $("#box"+i+x).css("background-color","rgb(192, 80, 89)");  


    //console.log("box"+i+x);  
    var red_alert = document.createElement("div");
    red_alert.setAttribute("class","Alert");
    red_alert.setAttribute("id","Warning"+i+x);

    return red_alert;
}

function display_green(i,x){
    $("#signal"+i+x).css("background-color","rgb(74, 164, 74)");
    $("#box"+i+x).css("background-color","rgb(47, 61, 74)");  

    //console.log("box"+i+x);
    var Checked = document.createElement("div");
    Checked.setAttribute("class","Alert");
    Checked.setAttribute("id","Warning"+i+x);

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