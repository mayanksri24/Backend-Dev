const express=require("express");
const app = express();
app.get("/",(req,res) =>{
    res.send("Welcome to Attendance Page")
});
app.get("/attendance", (req,res) => {
    if(req.query.present==="yes"){
        res.send(req.query.name+" is present")
    }
    else if(req.query.present==="no"){
        res.send(req.query.name+" is absent")
    }
});
app.listen(3000,() =>{
    console.log("server started")
}
)