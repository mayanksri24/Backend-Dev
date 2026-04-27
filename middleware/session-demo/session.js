const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

//middleware
app.use(express.json());
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model("User", userSchema);

//session setup
app.use(
    session({
        secret: "mysecretkey123",
        resave: false,
        saveUninitialized: false,
        cookie:{
            maxAge: 60 * 60 * 1000, // for 1 hour expire
            httpOnly: true, //http request is true
        },
    }),
);

//login(create session)

app.post("/login",(req,res)=>{
    const{username, password}=req.body;
    //dummy auth
    if(username === "admin" && password === "123")
    {
        req.session.user={
            username: username,
            role: "admin",
        }
        return res.json({
            msg:"login successful",
            sessionId: req.sessionID,
        });
    }
    res.status(401).json({msg:"Invalid credential"});
});

//Profile (protected)

app.get("/profile",(req,res)=>{
    if(!req.session.user){
        return res.status(401).json({
            msg:"please login first",
        });
    }
    res.json({
        msg:"user profile",
        user:req.session.user,
    });
});

//dashboard(protected)
app.get("/dashboard",(req,res)=>{
    if(!req.session.user){
        return res.status(401).json({
            msg:"unauthorized user",
        });
    }
    res.send(`welcome ${req.session.user.username}`);
});

//logout(destroy session)
app.get("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            return res.status(500).send("error logging out");
        }
        res.clearCookie("connect.sid"); //default cookie id or name
        res.send("logged out seccuessfully");
    });
});

//check session
app.get("/check-session",(req,res)=>{
    if(req.session.user){
        res.json({
            msg:"session active",
            user:req.session.user,
        });
    }
    else{
        res.json({
            msg:"no active session",
        });
    }
});

mongoose.connect("mongodb://127.0.0.1:27017/login")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.listen(3000,()=>{
    console.log("server started");
})