const http = require("http");
const fs = require("fs");
http.createServer((req, resp) => {
    let respMessage = "";
    switch(req.url){
        case "/":
            respMessage = "This is Home Page"
            break;
        case "/about":
            respMessage = "This is about Page"
            break;
        case "/contact":
            respMessage = "This is contact Page"
            break;
        default:
            respMessage = "404 Page not found"
            break;
    }
    const log = `${new Date().toISOString()} | ${req.url} | ${respMessage}\n`;
    fs.appendFile("log.txt", log, (err) =>{
        if(err){
            console.log("Error found");
        }
    });
    resp.end(respMessage);
}).listen(8000, () => {
    console.log("Server running on port 8000");
});
