const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const users = [
  // sample user (password: SecurePass123!)
  {
    email: "john@example.com",
    password: "$2b$10$wH8QzQ9Q9zZ6k7k8lQpQeO5ZlGkzQ3Gv9Xx0Qz8z8z8z8z8z8z8z8" 
  }
];

const loginAttempts = new Map(); // email -> { count, lockUntil }

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

/*
  Check if user is locked
*/
function checkLoginAttempts(email) {
  const record = loginAttempts.get(email);

  if (!record) return { allowed: true };

  if (record.lockUntil && record.lockUntil > Date.now()) {
    return {
      allowed: false,
      message: `Account locked. Try again after ${Math.ceil((record.lockUntil - Date.now()) / 60000)} minutes`
    };
  }

  return { allowed: true };
}

/*
  Record failed login attempt
*/
function recordFailedAttempt(email) {
  let record = loginAttempts.get(email);

  if (!record) {
    record = { count: 0, lockUntil: null };
  }

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockUntil = Date.now() + LOCK_TIME;
    record.count = 0;
  }

  loginAttempts.set(email, record);
}

/*
  Clear attempts on successful login
*/
function clearAttempts(email) {
  loginAttempts.delete(email);
}

/*
  Login route with rate limiting
*/
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const check = checkLoginAttempts(email);
  if (!check.allowed) {
    return res.status(429).json({ message: check.message });
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    recordFailedAttempt(email);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    recordFailedAttempt(email);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  clearAttempts(email);

  res.json({ message: "Login successful" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});