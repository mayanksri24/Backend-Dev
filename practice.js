// const mongoose=require("mongoose");
// const studentSchema=new mongoose.Schema({
//     name:{
//         type:String,
//         required:true
//     },
//     age:{
//         type:Number,
//         required:true,
//         min: [18, "Age must be greater than or equal to 18"]
//     },
//     email:{
//         type:String
//     }
// });
// //create model
// const Student=mongoose.model("Student",studentSchema) 

const express =require("express");
const mongoose=require("mongoose");

const app=express();
mongoose
.connect("mongodb://localhost:27017/blog")
.then(()=>console.log("MongoDB Connected"))
.catch((err)=>console.log("Mongoose Not Connected",err))
//Create Schema
const userSchema=new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:false  //not compulsory
        },
        priority:{
            type:String,
            enum: ["low", "medium", "high"],
            required:true
        },
        status:{
            type:String,
            enum:["pending","in-progress","completed"],
            required:true
        },
        dueDate:{
            type:Date,
            required:false
        },
        createdAt:{
            type:Date,
            default:Date.now
        },
        updatedAt:{
            type:Date,
            default:Date.now
        },
    },
    {timestamps:true},
);
const tasks=mongoose.model("Task",userSchema);
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.get("/tasks",async(req,res)=>{
    const allDbUsers = await User.find({})
    const html = `
<ul>
${allDbUsers.map(user => `<li>${user.title} - ${user.status}</li>`).join("")}
</ul>
`;
    res.send(html);
});
app.get("/api/tasks",async(req,res)=>{
    const allDbUsers=await Task.find({});
    res.json(allDbUsers);
});
app.post("/api/tasks",async(req,res)=>{
    const body = req.body;
    if(
        !body ||
        !body.title ||
        !body.description ||
        !body.priority || 
        !body.status ||
        !body.dueDate
    ){
        return res.status(400).json({msg:"All fields are required"});
    }
   const result = await Task.create({
    title: body.title,
    description: body.description,
    priority: body.priority,
    status: body.status,
    dueDate: body.dueDate,
});
    console.log("result",result);
    return res.status(201).json({msg:"Created for successful creation",user:result,});
});

app.patch("/api/tasks/:id", async (req, res) => {
    const updatedUser = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true } // returns updated data
    );
    res.json({ msg: "OK for successful read/update.", user: updatedUser });
});

app.delete("/api/tasks/bulk/:ids", async (req, res) => {
    const ids = req.params.ids.split(",");
    const result = await Task.deleteMany({
        _id: { $in: ids },
    });
    res.json({ deletedCount: result.deletedCount });
});

//delete multiple user 
app.delete("/api/tasks/:ids",async(req,res)=>{
    const ids =req.params.ids.split(",");
    const result = await Task.deleteMany({
        _id: {$in: ids},
    })
    res.json({deleteCount : result.deleteCount});
})



app.listen(8000,()=>{
    console.log("Server Started ");
});