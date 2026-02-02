const fs = require("fs");
fs.writeFileSync(
    "./answers.txt",
    "Answer-1: \nSynchronous:- Program will wait until the file operation is finished, then it will move to the next line \n"+
    "Asynchronous:- Program does not wait other works will happen in background and when it finishes it return via callback function",
    "utf-8"
);

fs.appendFileSync(
    "./answers.txt",
    "\nAnswer-2: \nWhen our file is too large we use Streams to read the file in small chunks, so memory stay safe",
    "utf-8"
);

fs.appendFileSync(
    "./answers.txt",
    "\nAnswer-3:- \nIt use to read file as a human readable text, not a binary data",
    "utf-8"
);

fs.appendFileSync(
    "./answers.txt",
    "\nAnswer4:- \nENOENT: says file not exist \nEACCESS: Permission Denied \nEEXIST: File already exists",
    "utf-8"
);

fs.appendFileSync(
    "./answers.txt",
    "\n Answer5:- \nDelete directory using cmd: fs.rmdirSync('folderName', {recursive:true})"
)

fs.appendFileSync(
    "./answers.txt",
    "\n Answer6:- \nTaking output of one stream and sending it directly ans input to another stream",
    "utf-8"
)

fs.appendFileSync(
    "./answers.txt",
    "\n Answer7:- \nPrevent program crash, Better user experience, System stability",
    "utf-8"
)

fs.appendFileSync(
    "./answers.txt",
    "\nAnser8:- \nwriteFile replaces the old content with the new content while appendFile used to add the data in existing file"
)
