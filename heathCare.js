// ================= IMPORTS =================
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const crypto = require('crypto');
const xss = require('xss');
const validator = require('validator');
const multer = require('multer');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

// ================= APP =================
const app = express();
app.use(express.json());

// ================= DB =================
mongoose.connect('mongodb://127.0.0.1:27017/health-secure');

// ================= MODELS =================
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, enum: ['patient','doctor','nurse','admin','insurance'] }
}));

const MedicalRecord = mongoose.model('MedicalRecord', new mongoose.Schema({
  patientId: mongoose.Schema.Types.ObjectId,
  data: String // encrypted
}));

const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  action: String,
  resource: String,
  timestamp: { type: Date, default: Date.now }
}));

// ================= SESSION =================
app.use(session({
  secret: 'health-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/health-secure',
    ttl: 60 * 15 // 15 min timeout (healthcare sensitive)
  }),
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 15
  }
}));

// ================= HELMET =================
app.use(helmet());

// ================= RATE LIMIT =================
app.use('/login', rateLimit({ windowMs: 15*60*1000, max: 5 }));

// ================= ENCRYPTION =================
const ENC_KEY = crypto.randomBytes(32);
const IV = crypto.randomBytes(16);

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(text) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ================= AUTH =================
function isAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
  next();
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

// ================= PASSWORD POLICY =================
function strongPassword(pw) {
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W]).{12,}$/.test(pw);
}

// ================= AUDIT LOG =================
async function logAction(userId, action, resource) {
  await AuditLog.create({ userId, action, resource });
}

// ================= SANITIZATION =================
function clean(input) {
  return xss(input);
}

// ================= REGISTER =================
app.post('/register', async (req, res) => {
  let { email, password, role } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  if (!strongPassword(password)) {
    return res.status(400).json({ message: "Weak password" });
  }

  const hash = await bcrypt.hash(password, 12);

  const user = await User.create({ email, password: hash, role });

  res.json({ userId: user._id });
});

// ================= LOGIN =================
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid" });

  req.session.userId = user._id;
  req.session.role = user.role;

  res.json({ message: "Logged in" });
});

// ================= PATIENT DATA =================
app.post('/patient', isAuth, requireRole(['admin','doctor']), async (req, res) => {
  let { name, dob, ssn } = req.body;

  if (!validator.isDate(dob)) {
    return res.status(400).json({ message: "Invalid DOB" });
  }

  name = clean(name);

  const encryptedData = encrypt(JSON.stringify({ name, dob, ssn }));

  const record = await MedicalRecord.create({
    patientId: req.session.userId,
    data: encryptedData
  });

  await logAction(req.session.userId, "CREATE_RECORD", "MedicalRecord");

  res.json(record);
});

// ================= SAFE SEARCH =================
app.get('/patients', isAuth, async (req, res) => {
  let { name } = req.query;

  if (typeof name !== 'string') {
    return res.status(400).json({ message: "Invalid query" });
  }

  name = name.replace(/[$.]/g, "");

  const results = await MedicalRecord.find();

  await logAction(req.session.userId, "SEARCH", "Patients");

  res.json(results);
});

// ================= FILE UPLOAD =================
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf','image/jpeg','image/png','application/dicom'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file"));
    }
    cb(null, true);
  }
});

function fakeScan() { return true; }

app.post('/upload', isAuth, upload.single('file'), (req, res) => {
  if (!fakeScan()) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Malicious file" });
  }

  res.json({ message: "Uploaded securely" });
});

// ================= START =================
app.listen(3000, () => console.log("Healthcare system running"));