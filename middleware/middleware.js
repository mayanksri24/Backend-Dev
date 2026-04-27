const express = require('express');
const app = express();

app.use((req, resp, next) => {
    console.log("MIddlware");
    next();
});
app.use((req, resp, next) => {
    console.log("MIddleware updated version");
    next();
});

// Application-level Middleware
app.use((req, resp, next) => {
    console.log("Request URL: ", req.url);
    console.log("Request method: ", req.method);
    next();   // for accessign next middleware
});


// Built-in Middleware  
app.use(express.json())  // => built-in middleware 
app.use(express.urlencoded({extended: true})) //  =>  built-in middleware


// Router Level Middleware  => we check authentication 
const checklogin = (req, resp ,next) => {
    const islogin = false;  // true se login message dikhayega
    if(!islogin) resp.send("Enter your Credentials").status(401);
    next();
};

app.get("/login", checklogin, (req, resp) => {
    resp.send("Login Successfully");
})

app.get("/", (req, resp) => {
    resp.send("Route SUccessfully");
});


// Authentication Middleware 
const authMiddleware = (req, resp, next) => {
    const token = req.headers.authorization;   // header me add krna hota hai
    if(!token) {
        return resp.status(400).json({message:"Enter your token"});
    }
    if(token != "none"){
        return resp.status(401).json({message: "Invalid token"});
    }
    next();
};

app.get("/auth", authMiddleware, (req, resp) => {
    resp.send("Valid Credentials Loginn ....");
});

// Error handling
app.use((err, req, resp, next) => {
    console.error("Error middleware ", err.message);
    resp.status(500).json({message: "Internal server error"});
});
app.get("/error", (req, resp) => {
    throw new Error("Something went wrong");
});

// 5- Error Handling middleware

app.get("/error", (req,res)=>{
    throw new Error ("Something Went Wrong");
});

app.use((err, req,res,next)=>{
    console.log("Error Middleware:", err.message);
    res.status(500).json({message:"Internal Server Error"});
});


app.listen(8000, ()=>  console.log("Server Started"));
