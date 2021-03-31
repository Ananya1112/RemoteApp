const socket = io();
const toggle1 = document.getElementById('toggle1');
const img1 = document.getElementById('img1');
const img2 = document.getElementById('img2');
const img = document.getElementById('img');
const pm25c = document.getElementById('pm25c');
const pm10c = document.getElementById('pm10c');
const time = document.getElementById('time');
const speak = document.getElementById('speak');
const toggle2 = document.getElementById('toggle2');
const toggle3 = document.getElementById('toggle3');

speak.addEventListener('click',e=>{
    speak.innerHTML="Listening";
    axios({
        method: 'post',
        url: '/TTS',
        //timeout: 5000
    })
    .then((respose)=>{
        speak.innerHTML="Speak"; 
        console.log(respose);
    })
    .catch(err=>{
        speak.innerHTML="Speak";
        console.log(err);
    });
    e.preventDefault();
});


toggle1.addEventListener('click',e => {

    e.preventDefault();
    change(toggle1.value);
});

function change(value){
    if(value == '1'){
        axios({
            method: 'post',
            url: '/update1n',
            data: {
                ledStatus : 0
            }
        });
        toggle1.value = "0";
        toggle1.innerHTML = "LED-OFF";
        img1.src = "off.png";
    }
    else{
        axios({
            method: 'post',
            url: '/update1f',
            data: {
                ledStatus : 1
            }
        });
        toggle1.value = "1";
        toggle1.innerHTML = "LED-ON";
        img1.src = "on.png";
    }
}



var xValue = 0;
window.onload = function() {
    var dataPoints = [];
    var dataPoints2 = [];
    
    var chart = new CanvasJS.Chart("chartContainer", {
        theme: "light2",
        title: {
            text: "PM10 Sensor"
        },
        data: [{
            type: "line",
            dataPoints: dataPoints
        }]
    });

    var chart2 = new CanvasJS.Chart("chartContainer2", {
        theme: "light2",
        title: {
            text: "PM2.5 Sensor"
        },
        data: [{
            type: "line",
            dataPoints: dataPoints2
        }]
    });
    
    stime();
    function addData(data,status) {
                dataPoints.push({x: xValue/3, y: data.pm10});
                dataPoints2.push({x: xValue/3, y: data.pm25});
                xValue++;
        chart.render();
        chart2.render();
        if(dataPoints.length>=10)
        {
            dataPoints.shift();
            dataPoints2.shift();
        }

        if(data.pm25 < 7 )
            pm25c.innerHTML = "Good";
        else if(data.pm25 < 15)
            pm25c.innerHTML = "Moderate";
        else if(data.pm25 < 30)
            pm25c.innerHTML = "Unhealthy for Sensitive Groups";
        else if(data.pm25 < 55)
            pm25c.innerHTML = "Unhealthy";
        else if(data.pm25 < 110)
            pm25c.innerHTML = "Very Unhealthy";
        else
            pm25c.innerHTML = "Hazardous";
            
        if(data.pm10 < 12 )
            pm10c.innerHTML = "Good";
        else if(data.pm10 < 25)
            pm10c.innerHTML = "Moderate";
        else if(data.pm10 < 50)
            pm10c.innerHTML = "Unhealthy for Sensitive Groups";
        else if(data.pm10 < 90)
            pm10c.innerHTML = "Unhealthy";
        else if(data.pm10 < 180)
            pm10c.innerHTML = "Very Unhealthy";
        else
            pm10c.innerHTML = "Hazardous";

    }
    function status(status,toggle,imgs){
        if(status == '1'){
            toggle.value = "1";
            toggle.innerHTML = "LED-ON";
            imgs.src = "on.png";
        }
        else{
            toggle.value = "0";
            toggle.innerHTML = "LED-OFF";
            imgs.src = "off.png";
        }
    }

    function statusf(status,toggle){
        if(status == '1'){
            toggle.value = "1";
            toggle.innerHTML = "FAN-ON";
        }
        else{
            toggle.value = "0";
            toggle.innerHTML = "FAN-OFF";
        }
    }

    socket.on('message', function(msg){
        status(msg.Led1,toggle1,img1);
        status(msg.Led2,toggle2,img2);
        statusf(msg.Fan,toggle3);
        if(xValue%3 == 0)
        {
        img.style.opacity = msg.table.ledb;    
        addData(msg.table);
        }
        else{
            xValue++;
        }
    });

    socket.on("status",function(msg){
        change(msg);
    });

    socket.on("statusf",function(msg){
        change3(msg);
    });
    

    function stime(){
        var today = new Date();
        var hh = today.getHours();
        var mm = checktime(today.getMinutes());
        var ss = checktime(today.getSeconds());
        
        time.innerHTML = hh+":"+mm+":"+ss;
        var t = setTimeout(stime, 500);
    }
    function checktime(i){
        if(i<10) return '0'+i;
        else return i;
    }
}


toggle2.addEventListener('click',e => {

    e.preventDefault();
    change2(toggle2.value);
});

function change2(value){
    if(value == '1'){
        axios({
            method: 'post',
            url: '/update2n',
            data: {
                ledStatus : 0
            }
        });
        toggle2.value = "0";
        toggle2.innerHTML = "LED-OFF";
        img2.src = "off.png";
    }
    else{
        axios({
            method: 'post',
            url: '/update2f',
            data: {
                ledStatus : 1
            }
        });
        toggle2.value = "1";
        toggle2.innerHTML = "LED-ON";
        img2.src = "on.png";
    }
}

toggle3.addEventListener('click',e => {

    e.preventDefault();
    change3(toggle3.value);
});

function change3(value){
    if(value == '1'){
        axios({
            method: 'post',
            url: '/update3n',
            data: {
                ledStatus : 0
            }
        });
        toggle3.value = "0";
        toggle3.innerHTML = "FAN-OFF";
    }
    else{
        axios({
            method: 'post',
            url: '/update3f',
            data: {
                ledStatus : 1
            }
        });
        toggle3.value = "1";
        toggle3.innerHTML = "FAN-ON";
    }
}