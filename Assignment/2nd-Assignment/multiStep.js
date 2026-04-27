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

// Step 1
app.get("/step1", (req, res) => {
  res.send(`
    <form method="POST">
      Name: <input name="name" />
      <button>Next</button>
    </form>
  `);
});

app.post("/step1", (req, res) => {
  req.session.user = { name: req.body.name };
  res.redirect("/step2");
});

// Step 2
app.get("/step2", (req, res) => {
  res.send(`
    <form method="POST">
      Email: <input name="email" />
      <button>Next</button>
    </form>
  `);
});

app.post("/step2", (req, res) => {
  req.session.user.email = req.body.email;
  res.redirect("/step3");
});

// Step 3
app.get("/step3", (req, res) => {
  res.send(`
    <form method="POST">
      Password: <input type="password" name="password" />
      <button>Submit</button>
    </form>
  `);
});

app.post("/step3", (req, res) => {
  req.session.user.password = req.body.password;

  res.send(`<pre>${JSON.stringify(req.session.user, null, 2)}</pre>`);
});

app.listen(3000, () => console.log("Server running"));