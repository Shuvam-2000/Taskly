import jwt from "jsonwebtoken";

export const isEmployeeLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided or bad format",
        success: false,
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach admin payload from token
    req.employee = decoded;

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};
