const express = require("express");
const {
  createCourse,
  getCourses,
  deleteCourse
} = require("../controllers/courseController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").post(protect, createCourse).get(protect, getCourses);
router.route("/:id").delete(protect, deleteCourse);

module.exports = router;
