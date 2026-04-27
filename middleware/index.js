//syntax 

const bcrypt = require("bcrypt");
const password = "12345";
const hashedPsd = await bcrypt.hash(password, 10) // the hash value of the password will be under 10 
console.log(hashedPsd);

//login

const isMath = await bcrypt.compare("12345", hashedPsd);
console.log(isMath);