const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

app.use(express.json());
app.use(express.static('public'));
app.use(express.static('node-modules'));
app.set('view engine','ejs');
const http = require('http');
const socketio = require('socket.io'); 
const port = process.env.PORT||3000;
const server = http.createServer(app);
const io = socketio(server);

var admin = require("firebase-admin");
const csrfMiddleware = csrf({ cookie: true });
var table=10;
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
        Ledstatus : 1
        };
    database.ref("/").update(newData);
})

app.post('/update2',function(req,res){
    const newData = {
        Ledstatus : 0
        };
    database.ref("/").update(newData);
})

led.on("value",e=>{
    table=e.val().table;
    io.emit('message',table);
});

server.listen(port, () => {
    console.log('listening on *:3000');
  });
