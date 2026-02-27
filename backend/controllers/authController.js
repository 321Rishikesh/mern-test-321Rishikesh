const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const getJwtSecret = () => process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

const generateToken = (studentId) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: studentId }, jwtSecret, { expiresIn: "7d" });
};

const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide name, email, and password");
    }

    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      res.status(400);
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      token: generateToken(student._id)
    });
  } catch (error) {
    next(error);
  }
};

const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    const student = await Student.findOne({ email: email.toLowerCase() });

    if (!student) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      token: generateToken(student._id)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  loginStudent
};
