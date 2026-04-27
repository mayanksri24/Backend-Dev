const express = require('express');
const app = express();

app.use((req,res, next)=>{
    console.log("Signup Form");
    next();
});
app.use((req,res,next)=>{
    console.log("Login Form");
    next();
});

app.get("/user",(req,res)=>{
    res.send("Route Executed");
});

app.listen(8000,()=>{
    console.log("Server Started");
});
