import jwt from "jsonwebtoken";
import config from "../config/config.data.js";

export const authMiddleware = (req, res, next) => {
  const [scheme, token] = String(req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Bearer token is required" });
  }

  try {
    req.user = jwt.verify(token, config.JWT_SECRET_KEY);
    if (!req.user?.userid || !req.user?.userRole) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired credentials" });
  }
};
