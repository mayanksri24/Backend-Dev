const http = require('http');
http.createServer((req, resp) => {
    resp.end("Hello Mayank");
}).listen(3000)