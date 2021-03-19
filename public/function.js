const socket = io();
const toggle = document.getElementById('toggle');
const img1 = document.getElementById('img1');
const img2 = document.getElementById('img2');
const pm25c = document.getElementById('pm25c');
const pm10c = document.getElementById('pm10c');
const time = document.getElementById('time');
const speak = document.getElementById('speak');

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


toggle.addEventListener('click',e => {

    e.preventDefault();
    if(toggle.value == '1'){
    axios({
        method: 'post',
        url: '/update',
        data: {
            ledStatus : 0
        }
    });
    toggle.value = "0";
    toggle.innerHTML = "LED-OFF";
    img1.src = "off.png";
}
else{
    axios({
        method: 'post',
        url: '/update2',
        data: {
            ledStatus : 1
        }
    });
    toggle.value = "1";
    toggle.innerHTML = "LED-On";
    img1.src = "on.png";
}
});
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

        if(status == '1'){
            toggle.value = "1";
            toggle.innerHTML = "LED-On";
            img1.src = "on.png";
        }
        else{
            toggle.value = "0";
            toggle.innerHTML = "LED-OFF";
            img1.src = "off.png";
        }
            



    }
    socket.on('message', function(msg){
        if(xValue%3 == 0)
        {
        img2.style.opacity = msg.table.ledb;    
        addData(msg.table,msg.Ledstatus);
        }
        else{
            xValue++;
        }
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
