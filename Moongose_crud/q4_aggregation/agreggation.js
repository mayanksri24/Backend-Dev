const mongoose = require("mongoose");
const Student = require("../q1-crud/models/Student");

const connect = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/studentDB");
};

// 1. Avg GPA by department
const avgGPA = async () => {
  const data = await Student.aggregate([
    { $group: { _id: "$department", avgGPA: { $avg: "$gpa" } } }
  ]);
  console.log("Avg GPA:", data);
};

// 2. Most popular courses
const popularCourses = async () => {
  const data = await Student.aggregate([
    { $unwind: "$courses" },
    { $group: { _id: "$courses", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log("Popular courses:", data);
};

// 3. Performance report
const performance = async () => {
  const data = await Student.aggregate([
    {
      $project: {
        name: 1,
        performance: {
          $cond: [{ $gte: ["$gpa", 3.5] }, "Excellent", "Average"]
        }
      }
    }
  ]);
  console.log("Performance:", data);
};

const run = async () => {
  await connect();
  await avgGPA();
  await popularCourses();
  await performance();
  process.exit();
};

run();