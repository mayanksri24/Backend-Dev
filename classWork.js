import express from "express";
import mongoose from "mongoose";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/auth").then(() => {
  console.log("Connected to MongoDB");
});
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);
//Mongo Injection
// {
//   "email": {"ne": null},
//   "password": {"ne": null}
// }
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //validation
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      message: "Invalid input",
    });
  }
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  res.status(200).json({
    message: "Login successful",
    user: user,
  });
});
// http://localhost:8080/comment?cm=<script>alert('Hacked')</script>
app.get("/comment", (req, res) => {
  res.send(`<h1>${req.query.cm}</h1>`);
});
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
//MongoStore:
const session = require("express-session");
const MongoStore = require("connect-mongo");

app.use(
  session({
    secret: "secret123",
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/test",
    }),
    cookie: {
      httpOnly: true,
      secure: false,
    },
  }),
);