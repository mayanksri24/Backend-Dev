const express = require("express");
const session = require("express-session");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true
  })
);

// Dummy users
const users = [
  { username: "admin", password: "123", role: "admin" },
  { username: "user", password: "123", role: "user" }
];

// Login form
app.get("/login", (req, res) => {
  res.send(`
    <form method="POST">
      Username: <input name="username"/>
      Password: <input type="password" name="password"/>
      <button>Login</button>
    </form>
  `);
});

// Login logic
app.post("/login", (req, res) => {
  const user = users.find(
    u => u.username === req.body.username && u.password === req.body.password
  );

  if (!user) return res.send("Invalid credentials");

  req.session.user = user;
  res.send("Logged in");
});

// Auth middleware
const isAuth = (req, res, next) => {
  if (!req.session.user) return res.send("Login required");
  next();
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.session.user.role !== "admin")
    return res.send("Admin only");
  next();
};

// Admin route
app.get("/admin", isAuth, isAdmin, (req, res) => {
  res.send("Welcome Admin");
});

app.listen(3000, () => console.log("Server running"));