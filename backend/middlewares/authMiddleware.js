const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const getJwtSecret = () => process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, token missing");
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      res.status(500);
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, jwtSecret);
    const student = await Student.findById(decoded.id).select("-password");

    if (!student) {
      res.status(401);
      throw new Error("Not authorized, student not found");
    }

    req.student = student;
    next();
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(401);
    }
    next(error);
  }
};

module.exports = { protect };
