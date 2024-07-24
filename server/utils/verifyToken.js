import { getUserById } from "../services/user.service.js";
import { errorHandler } from "./errorHandler.js";
import jwt from "jsonwebtoken";
import { logger } from "./winstonLogger.js";
import User from "../models/User.model.js";
import Role from "../models/Role.model.js";
import { jwtDecode } from "jwt-decode";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return next(errorHandler(404, "No token, not authorized!"));
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) return next(errorHandler(403, "Invalid token"));
  const user = await getUserById(decoded.id);
  if (!user) return next(errorHandler(400, "Could not destructure user from token!"));
  req.user = user;
  next();
};

export const verifyTokenTwo = async (req, res, next) => {
  const headers = req.headers.authorization;

  if (!headers) {
    logger.info(`No headers, not authorized!`);
    return res.status(403, "No headers, Not Authorized!!");
  }

  const token = headers.split(" ")[1]
  try {
    const decoded = jwtDecode(token)
     if(Date.now() >= decoded.exp){
      logger.info(`Token expired`)
      return res.status(403).json("Token expired!!")
     }
     const role = await Role.findOne({isDeleted:false, _id:decoded.role}).select("roleName").exec()
     const user = await User.findOne({isDeleted:false, _id:decoded._id}).select("firstName lastName email role").exec()

     req.user = user
     req.roleName = role.roleName
  } catch (error) {
    logger.error(`Could not authentocate, ${error}`)
    return res.status(400, "could not authenticate" + error.message)
  }
};
