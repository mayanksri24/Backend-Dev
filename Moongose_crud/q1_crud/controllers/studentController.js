const Student = require("../models/Student");

// Add student
exports.addStudent = async (req, res) => {
  const student = await Student.create(req.body);
  res.json(student);
};

// Get all students
exports.getStudents = async (req, res) => {
  const students = await Student.find();
  res.json(students);
};

// Find by email
exports.getStudentByEmail = async (req, res) => {
  const student = await Student.findOne({ email: req.params.email });
  res.json(student);
};

// Update GPA
exports.updateGPA = async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { gpa: req.body.gpa },
    { new: true }
  );
  res.json(student);
};

// Delete student
exports.deleteStudent = async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
};