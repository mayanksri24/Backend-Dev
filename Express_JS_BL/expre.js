// const url = require("url");
// const http = require("http");

// const myServer = http.createServer((req,res)=>{
//     const myUrl = url.parse(req.url,true);
//     console.log(myUrl);
//     const log = `${Date.now()} : ${req.method} ${req.url} "New request received\n"`
//     switch(myUrl.pathname){
//         case "/":
//             res.end("this is home page");
//             break;
//         case "/about":
//             const aa= res.end("this is about page");
//             const username=myUrl.query.myname;
//             res.end(`Hi ${username}`)
//             break;
//         case "/contact":
//             res.end("this is contact page");
//             break;

//         case "/signup":
//             if(req.method === "GET"){
//                 res.end("This is Sign Up form");
//             }
//             else if(req.method === "POST"){
//                 res.end("Success");
//             }
//             break;
//             case "/candidate":
//             if(req.method === "PUT"){
//                 res.end("This is Candidate form");
//             }
//             else if(req.method === "PATCH"){
//                 res.end("Patch Success");
//             }
//             else if(req.method === "DELETE"){
//                 res.end("Delete Success");
//             }
//             else{
//                 res.end("Invalid Method");
//             }
//             break;
//         default:
//             res.end("404");

//     }
// })
// myServer.listen(8000,()=> console.log("server started"));




//const http = require("http");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Home Page");
});

app.get("/about", (req, res) => {
    res.send("about Page");
});

app.get("/search", (req, res) => {
    const search=req.query.search;
    
    res.send("Search page "+"Hey "+ req.query.name + "you are "+ req.query.age);
});

//const myServer= http.createServer(app);

app.listen(8000, () => console.log("server Started"));






