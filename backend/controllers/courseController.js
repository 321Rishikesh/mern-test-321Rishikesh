const Course = require("../models/Course");

const createCourse = async (req, res, next) => {
  try {
    const { courseName, courseDescription, instructor } = req.body;

    if (!courseName || !courseDescription || !instructor) {
      res.status(400);
      throw new Error("Please provide courseName, courseDescription, and instructor");
    }

    const course = await Course.create({
      courseName,
      courseDescription,
      instructor,
      createdBy: req.student._id
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const { search = "" } = req.query;

    const filter = { createdBy: req.student._id };
    if (search.trim()) {
      filter.$or = [
        { courseName: { $regex: search, $options: "i" } },
        { courseDescription: { $regex: search, $options: "i" } },
        { instructor: { $regex: search, $options: "i" } }
      ];
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    if (course.createdBy.toString() !== req.student._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this course");
    }

    await course.deleteOne();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourse,
  getCourses,
  deleteCourse
};
