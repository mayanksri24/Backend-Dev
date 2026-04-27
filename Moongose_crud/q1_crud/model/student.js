const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  gpa: Number,
  city: String,
  department: String,
  courses: [String]
});

module.exports = mongoose.model("Student", studentSchema);