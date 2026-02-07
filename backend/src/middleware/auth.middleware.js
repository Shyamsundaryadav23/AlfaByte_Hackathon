import { verifyToken } from "../config/jwt.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ msg: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ msg: "Invalid token" });

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Authentication failed" });
  }
};
