const mongoose = require("mongoose");
const Student = require("../q1-crud/models/Student");

const connect = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/studentDB");
};

// 1. GPA between 3.0 and 3.5
const gpaRange = async () => {
  const data = await Student.find({
    gpa: { $gte: 3.0, $lte: 3.5 }
  });
  console.log("GPA Range:", data);
};

// 2. More than 5 courses
const moreCourses = async () => {
  const data = await Student.find({
    $expr: { $gt: [{ $size: "$courses" }, 5] }
  });
  console.log("More than 5 courses:", data);
};

// 3. Top 10 students
const topStudents = async () => {
  const data = await Student.find().sort({ gpa: -1 }).limit(10);
  console.log("Top students:", data);
};

// 4. Count by city
const countCity = async () => {
  const data = await Student.aggregate([
    { $group: { _id: "$city", count: { $sum: 1 } } }
  ]);
  console.log("City count:", data);
};

const run = async () => {
  await connect();
  await gpaRange();
  await moreCourses();
  await topStudents();
  await countCity();
  process.exit();
};

run();