// ================= IMPORTS =================
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcrypt');
const xss = require('xss');
const validator = require('validator');

// ================= APP =================
const app = express();
app.use(express.json());

// ================= DATABASE =================
mongoose.connect('mongodb://127.0.0.1:27017/secure-social');

// ================= MODELS =================
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  bio: String,
  profileUrl: String
}));

const Post = mongoose.model('Post', new mongoose.Schema({
  content: String,
  userId: mongoose.Schema.Types.ObjectId
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  text: String,
  from: mongoose.Schema.Types.ObjectId,
  to: mongoose.Schema.Types.ObjectId
}));

const Comment = mongoose.model('Comment', new mongoose.Schema({
  text: String,
  postId: mongoose.Schema.Types.ObjectId
}));

// ================= SESSION =================
app.use(session({
  name: 'session-id',
  secret: 'super-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/secure-social',
    ttl: 60 * 60 * 24
  }),
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// ================= HELMET =================
app.use(helmet());

// ================= CORS =================
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'], // web + mobile
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ================= SANITIZATION CONFIG =================

// Allow limited HTML for posts
const postXSS = new xss.FilterXSS({
  whiteList: {
    b: [],
    i: [],
    em: [],
    strong: [],
    a: ['href']
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script']
});

// Strict sanitizer (no HTML)
function strictSanitize(input) {
  return xss(input);
}

// ================= GLOBAL SANITIZE MIDDLEWARE =================
function sanitizeRequest(req, res, next) {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
}

app.use(sanitizeRequest);

// ================= VALIDATION HELPERS =================
function validateEmail(email) {
  return validator.isEmail(email);
}

function validateURL(url) {
  return validator.isURL(url);
}

// ================= AUTH MIDDLEWARE =================
function isAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// ================= 1. USER REGISTRATION =================
app.post('/register', async (req, res) => {
  let { username, email, password, bio, profileUrl } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  if (profileUrl && !validateURL(profileUrl)) {
    return res.status(400).json({ message: "Invalid URL" });
  }

  username = strictSanitize(username);
  bio = bio ? strictSanitize(bio) : '';
  profileUrl = profileUrl ? strictSanitize(profileUrl) : '';

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashed,
    bio,
    profileUrl
  });

  res.json({ message: "User registered", userId: user._id });
});

// ================= LOGIN =================
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  req.session.userId = user._id;

  res.json({ message: "Login successful" });
});

// ================= 2. POST CREATION =================
app.post('/posts', isAuth, async (req, res) => {
  let { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content required" });
  }

  const safeContent = postXSS.process(content);

  const post = await Post.create({
    content: safeContent,
    userId: req.session.userId
  });

  res.json(post);
});

// ================= 3. DIRECT MESSAGE =================
app.post('/messages', isAuth, async (req, res) => {
  let { text, to } = req.body;

  if (!text || !to) {
    return res.status(400).json({ message: "Invalid input" });
  }

  text = strictSanitize(text);

  const msg = await Message.create({
    text,
    from: req.session.userId,
    to
  });

  res.json(msg);
});

// ================= 4. COMMENTS =================
app.post('/comments', isAuth, async (req, res) => {
  let { text, postId } = req.body;

  if (!text || !postId) {
    return res.status(400).json({ message: "Invalid input" });
  }

  text = strictSanitize(text);

  const comment = await Comment.create({
    text,
    postId
  });

  res.json(comment);
});

// ================= PROTECTED ROUTE =================
app.get('/dashboard', isAuth, (req, res) => {
  res.json({ message: "Secure access granted" });
});

// ================= START =================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});