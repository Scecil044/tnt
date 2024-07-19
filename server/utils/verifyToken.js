
import { getUserById } from "../services/user.service.js";
import { errorHandler } from "./errorHandler.js";
import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return next(errorHandler(404, "No token, not authorized!"));
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if(!decoded) return next(errorHandler(403, "Invalid token"))
  const user = await getUserById(decoded.id);
  if (!user) return next(errorHandler(400, "Could not destructure user from token!"));
  req.user = user;
  next();
};
