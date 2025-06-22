import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.userId = decoded.userId;
      req.user = user;
      next();
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error in authentication" });
  }
};

const requireEmailVerification = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({ 
      message: "Email verification required",
      requiresVerification: true 
    });
  }
  next();
};

export { authMiddleware, requireEmailVerification };