const express = require("express");
const mongoose = require("mongoose");

const app = express();

//Built-in Middleware
app.use(express.json());
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);
//Logger Middleware used Globally 
const logger = (req,res,next)=>{
    console.log("Method",req.method);
    console.log("URL",req.url);
    next();
};

//Apply Globally
app.use(logger);

//Validation Middleware
const validate =(req,res,next)=>{
    const {name}=req.body;
    if(!name){
        return res.status(400).json({msg:"Name is required",});
    }
    next();
};

//Route-Specific Middleware
const checkAdmin = (req,res,next)=>{
    //Dummy Check(JWT)
    const isAdmin=false;
    if(!isAdmin){
        return res.status(403).json({msg:"Access Denied",});
    }
    next();
};


//Home Route
app.get("/",(req,res)=>{
    res.send("Welcome to home page");
});

//Validation middleware Route
app.post("/user", validate, async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();

        res.json({
            msg: "User created successfully",
            data: savedUser
        });
    } catch (error) {
        res.status(500).json({ msg: "Error saving user", error });
    }
});
//Route-specific middleware route
app.get("/admin",checkAdmin,(req,res)=>{
    res.send("Welome admin");
});

mongoose.connect("mongodb://127.0.0.1:27017/mydatabase")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.listen(8080,()=>console.log("Sever Started"));
