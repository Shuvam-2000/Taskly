import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";

// load environment variables
configDotenv();

export const isCompanLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided or bad format",
        success: false,
      });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach company data
    req.company = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};
