const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const spawn = require('child_process').spawnSync;
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('node-modules'));
app.set('view engine','ejs');
const http = require('http');
const socketio = require('socket.io'); 
const port = process.env.PORT||3000;
const server = http.createServer(app);
const io = socketio(server);
const nodemailer = require('nodemailer');


var admin = require("firebase-admin");
const csrfMiddleware = csrf({ cookie: true });
var table={
  Led1:1,
  Led2:1,
  Fan:1,
  table :{
    ledb:0.5,
    pm10:150,
    pm25:32
  }
};
app.engine("html", require("ejs").renderFile);
app.use(cookieParser());
app.use(csrfMiddleware);

var serviceAccount = require(__dirname+"/firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://remote-b7c6f-default-rtdb.firebaseio.com/"
});

const database = admin.database();
const led = database.ref('/');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sumits4425@gmail.com',
    pass: 'Sumit@1234'
  }
});

var mailOptions = {
  from: 'sumits4425@gmail.com',
  to: 'sumit.singhss194@gmail.com',
  subject: 'Alert in your Home',
  text: 'The air concentrations are hazardous'
};


app.all("*", (req, res, next) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    next();
  });

app.get("/", function(req,res){
    const sessionCookie = req.cookies.session || "";  
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then(() => {
        res.redirect("/profile");
      })
      .catch((error) => {
        res.render("login");
    });
});
  
app.get("/profile", function (req, res) {
    const sessionCookie = req.cookies.session || "";  
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then(() => {
        res.render("profile");
      })
      .catch((error) => {
        res.redirect("/");
      });
  });

  app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();
  
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
  
    admin
      .auth()
      .createSessionCookie(idToken, { expiresIn })
      .then(
        (sessionCookie) => {
          const options = { maxAge: expiresIn, httpOnly: true };
          res.cookie("session", sessionCookie, options);
          res.end(JSON.stringify({ status: "success" }));
        },
        (error) => {
          res.status(401).send("UNAUTHORIZED REQUEST!");
        }
      );
  });

  app.get("/sessionLogout", (req, res) => {
    res.clearCookie("session");
    res.redirect("/");
  });

led.on("value",e=>{
    table=e.val();
    if(table.table.pm10>180||table.table.pm25>110){
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      }
    });}
    io.emit('message',table);
});

app.post('/TTS',function(req,res){
  const python=spawn('python',['./voice.py',table.table.pm10,table.table.pm25]);

  var data=python.stdout.toString();
  console.log(data);
  
  if(data.includes("l0",0)){
    io.emit('status',"1");
  }
  if(data.includes("l1",0)){
    io.emit('status',"0");
  }
  if(data.includes("f0",0)){
    io.emit('statusf',"1");
  }
  if(data.includes("f1",0)){
    io.emit('statusf',"0");
  }
  
  res.sendStatus(200);
})

app.post('/update1n',function(req,res){
  const newData = {
      Led1: 0
      };
  database.ref("/").update(newData);
  res.sendStatus(200);
})

app.post('/update1f',function(req,res){
  const newData = {
      Led1: 1
      };
  database.ref("/").update(newData);
  res.sendStatus(200);
})
app.post('/update2n',function(req,res){
  const newData = {
      Led2: 0
      };
  database.ref("/").update(newData);
  res.sendStatus(200);
})

app.post('/update2f',function(req,res){
  const newData = {
      Led2: 1
      };
  database.ref("/").update(newData);
  res.sendStatus(200);
})

app.post('/update3n',function(req,res){
  const newData = {
      Fan: 0
      };
  database.ref("/").update(newData);
  res.sendStatus(200);
})

app.post('/update3f',function(req,res){
  const newData = {
      Fan: 1
      };
  database.ref("/").update(newData);
  res.sendStatus(200);
})

server.listen(port, () => {
    console.log('listening on *:3000');
  });
