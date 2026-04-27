const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentController");

router.post("/", ctrl.addStudent);
router.get("/", ctrl.getStudents);
router.get("/:email", ctrl.getStudentByEmail);
router.put("/:id", ctrl.updateGPA);
router.delete("/:id", ctrl.deleteStudent);

module.exports = router;