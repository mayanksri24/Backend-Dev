// ================== IMPORTS ==================
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');

// ================== APP SETUP ==================
const app = express();
app.use(express.json());

// ================== DATABASE ==================
mongoose.connect('mongodb://127.0.0.1:27017/secure-shop');

// ================== MODELS ==================
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  password: String
}));

const Product = mongoose.model('Product', new mongoose.Schema({
  name: String,
  price: Number
}));

const Review = mongoose.model('Review', new mongoose.Schema({
  comment: String
}));

// ================== SESSION ==================
app.use(session({
  name: 'session-id',
  secret: 'session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/secure-shop',
    collectionName: 'sessions'
  }),
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// ================== HELMET ==================
app.use(helmet());

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "https://cdn.example.com"],
    scriptSrc: ["'self'", "https://www.youtube.com"],
    frameSrc: ["https://www.youtube.com"],
    connectSrc: ["'self'", "https://payment-gateway.com"],
    objectSrc: ["'none'"]
  }
}));

// ================== RATE LIMIT ==================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
});

app.use('/login', loginLimiter);
app.use('/api', apiLimiter);

// ================== AUTH MIDDLEWARE ==================
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// ================== AUTH ROUTES ==================
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({ email, password: hashed });

  res.json({ message: "Registered", userId: user._id });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  req.session.userId = user._id;

  res.json({ message: "Login successful" });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

// ================== PRODUCT SEARCH (INJECTION SAFE) ==================
app.get('/api/products', async (req, res) => {
  let { name } = req.query;

  if (typeof name !== 'string') {
    return res.status(400).json({ message: "Invalid query" });
  }

  name = name.replace(/[$.]/g, "");

  const products = await Product.find({
    name: { $regex: name, $options: 'i' }
  });

  res.json(products);
});

// ================== REVIEW (XSS SAFE) ==================
app.post('/api/reviews', isAuthenticated, async (req, res) => {
  let { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ message: "Comment required" });
  }

  const safeComment = xss(comment);

  const review = await Review.create({
    comment: safeComment
  });

  res.json(review);
});

// ================== TEST ROUTES ==================
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.json({ message: "Secure dashboard access" });
});

// ================== START ==================
app.listen(3000, () => {
  console.log("Secure server running on port 3000");
});