const http = require('http');
let name = 'Skyler'
const user = [
    {
        Name: 'Hank',
        Age: '25'
    },
    {
        Name:'Skyler',
        Age:'32'
    },
    {
        Name:'Walt',
        Age: '52'
    }
]
http.createServer((req, resp) => {
    let message = ""
    switch(req.url){
        case '/':
            message = `Welcome, `+name+``
            break;
        case '/about':
            resp.setHeader("Content-Type", "text/html")
            resp.write(`
                <html>
                <head>
                <title>About</title>
                </head>
                <body>
                    <h1>Hello My Friend `+name+` this is about page</h1>
                </body>
                </html>`)
            break;
        case '/user':
            resp.setHeader("Content-Type", "text/JSON")
            resp.write(JSON.stringify(user))
            // resp.write(`Is this `+name+` and age is `+age+` ?`)
            break;
        default:
            message = '404 Page not Found'
    }
    resp.end(message)
}).listen(3000)