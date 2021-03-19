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
  Ledstatus:1,
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

app.post('/update',function(req,res){
    const newData = {
        Ledstatus : 0
        };
    database.ref("/").update(newData);
})

app.post('/update2',function(req,res){
    const newData = {
        Ledstatus : 1
        };
    database.ref("/").update(newData);
})

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

  spawn('python',['./voice.py',table.table.pm10,table.table.pm25]);
  res.sendStatus(200);
})



server.listen(port, () => {
    console.log('listening on *:3000');
  });
