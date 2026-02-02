//Common errors
// ENOENT = file does not exist
// EACCES = permission denied
// EEXIST = file already exists
// EISDIR = file expected, folder does not exist

// error handling with call back

const fs = require("fs");
// fs.readFile("./notes.txt", "utf-8", (err, data) => {
//     if(err){
//         if(err.code === "ENOENT"){
//             console.log("File Not Found");
//         }
//         return;
//     }
//     console.log(data);

// });



//Error handling with async/await

// const fsPromises=require("fs")
// async function readFileSafe(){
//     try{
// const data= await fsPromises.readFile("./data.text", "utf-8");
// comsole.log(data);
//     }catch(err){
//         console.log("Error:", err.code);
//     }
// }


// Stream Error Handling
const readStream= fs.createReadStream("./sample.txt");
const writeStream= fs.createWriteStream("./source.txt");

readStream.on("error", (err)=>{
    console.log("Read Error:", err.message);
    writeStream.destroy();
});

writeStream.on("error", (err)=>{
    console.log("Write Error:", err.message);
    readStream.destroy();
});