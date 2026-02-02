const fs = require('fs');

//Create file 
fs.writeFileSync("./file.txt", "Here we learn Node js \n I am Walter H. White ")

// Read file
const res = fs.readFileSync("./file.txt", "utf-8");

// Counting Words
const words = res.trim().split(/\s+/);
const count = words.length;

//Creating new file and store count in that file
fs.writeFileSync("./fileWords.txt", "No. of words in file: "+count.toString())
