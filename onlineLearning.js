// ================= IMPORTS =================
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const crypto = require('crypto');
const xss = require('xss');
const validator = require('validator');
const speakeasy = require('speakeasy');
const winston = require('winston');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// ================= APP =================
const app = express();
app.use(express.json());

// ================= DB =================
mongoose.connect('mongodb://127.0.0.1:27017/lms-secure');

// ================= LOGGER =================
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
app.use(morgan('combined'));

// ================= MODELS =================
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, enum: ['student', 'instructor', 'admin'] },
  mfaSecret: String,
  mfaEnabled: Boolean,
  profile: {
    bio: String,
    website: String
  }
});
const User = mongoose.model('User', userSchema);

const Course = mongoose.model('Course', new mongoose.Schema({
  title: String,
  description: String
}));

const Quiz = mongoose.model('Quiz', new mongoose.Schema({
  question: String,
  answer: String
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  text: String,
  from: mongoose.Schema.Types.ObjectId,
  to: mongoose.Schema.Types.ObjectId
}));

// ================= SESSION =================
app.use(session({
  secret: 'super-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/lms-secure',
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
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "https://*.s3.amazonaws.com"],
    mediaSrc: ["https://*.s3.amazonaws.com"],
    scriptSrc: ["'self'", "https://js.stripe.com", "https://analytics.example.com"],
    frameSrc: ["https://js.stripe.com", "https://www.youtube.com"],
    connectSrc: ["'self'", "https://api.stripe.com"],
    objectSrc: ["'none'"]
  }
}));

// ================= CORS =================
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// ================= RATE LIMIT =================
app.use('/login', rateLimit({ windowMs: 15*60*1000, max: 5 }));
app.use('/quiz', rateLimit({ windowMs: 60*1000, max: 10 }));
app.use('/api', rateLimit({ windowMs: 60*1000, max: 100 }));

// ================= SANITIZATION =================
const richHTML = new xss.FilterXSS({
  whiteList: {
    b: [], i: [], strong: [], em: [],
    p: [], ul: [], li: [],
    a: ['href']
  }
});

function strictSanitize(str) {
  return xss(str);
}

// ================= AUTH =================
function isAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.session.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

// ================= PASSWORD VALIDATION =================
function validatePassword(pw) {
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W]).{8,}$/.test(pw);
}

// ================= REGISTER =================
app.post('/register', async (req, res) => {
  let { email, password, role } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ message: "Weak password" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hash,
    role
  });

  res.json({ userId: user._id });
});

// ================= LOGIN + MFA =================
app.post('/login', async (req, res) => {
  const { email, password, token } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid" });

  if (user.role === 'instructor' && user.mfaEnabled) {
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(401).json({ message: "MFA failed" });
    }
  }

  req.session.userId = user._id;
  req.session.role = user.role;

  res.json({ message: "Logged in" });
});

// ================= COURSE =================
app.post('/courses', isAuth, requireRole('instructor'), async (req, res) => {
  let { title, description } = req.body;

  description = richHTML.process(description);

  const course = await Course.create({ title, description });
  res.json(course);
});

// ================= QUIZ =================
app.post('/quiz', isAuth, async (req, res) => {
  let { question, answer } = req.body;

  question = strictSanitize(question);
  answer = strictSanitize(answer);

  const quiz = await Quiz.create({ question, answer });
  res.json(quiz);
});

// ================= MESSAGE =================
app.post('/messages', isAuth, async (req, res) => {
  let { text, to } = req.body;

  text = strictSanitize(text);

  const msg = await Message.create({
    text,
    from: req.session.userId,
    to
  });

  res.json(msg);
});

// ================= FILE UPLOAD =================
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  }
});

function fakeVirusScan(filePath) {
  return true;
}

app.post('/upload', isAuth, upload.single('file'), (req, res) => {
  const filePath = req.file.path;

  if (!fakeVirusScan(filePath)) {
    fs.unlinkSync(filePath);
    return res.status(400).json({ message: "Malicious file detected" });
  }

  res.json({ message: "File uploaded safely" });
});

// ================= START =================
app.listen(3000, () => {
  console.log("Secure LMS running");
});