const fs = require('fs');
const path = require('path');

const cmd = process.argv[2];
const filePath = process.argv[3];
const content = process.argv[4];

function errorHandling(err) {
    if (err.code === 'ENOENT') {
        console.log("File not found");
    } else if (err.code === 'EACCES') {
        console.log("Permission Denied")
    } else {
        console.log("Error Occurred")
    }
}
if (cmd === 'read') {
    fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) {
            console.log(errorHandling(err));
        }
        console.log(data)
    });
}
else if (cmd === 'write') {
    fs.writeFile(filePath, content, 'utf-8', (err, data) => {
        if (err) console.log(errorHandling(err));
        console.log(data);
    });
}

else if (cmd === 'append') {
    fs.appendFile(filePath, "\n"+content + "\n", (err) => {
        if (err) console.log(errorHandling(err));
        console.log("Content append Successfully");
    });
}

else if (cmd === 'copy') {
    fs.copyFile(filePath, "./copyFile.txt");
}
else if (cmd === 'copy') {
    fs.unlink("./copy.File.txt");
}
else if (cmd === 'dir') {
    fs.readdir("./", (err, files) => {
        if (err) console.log(errorHandling(err));
        console.log(files);
    })
}