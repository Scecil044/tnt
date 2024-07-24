import jwt from "jsonwebtoken";
import Token from "../models/Token.model.js";
import moment from "moment";
import { tokenTypes } from "../config/token.js";
import { getUserByEmail } from "./user.service.js";

const generateToken = async (user, expires, type) => {
  const payload = {
    _id: user._id,
    iat: moment().unix(),
    exp: expires.unix(),
    type
  };
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const saveToken = async (token, userId, expires, type, isBlackListed = false) => {
  return await Token.create({
    user: userId,
    token,
    type,
    expires: expires.toDate(),
    isBlackListed
  });
};

export const generateAuthTokens = async (user, overrideExpirationNumber = null, ignoreRefreshToken = null) => {
  try {
    let expirationMinutes = process.env.JWT_ACCESS_EXPIRATION_MINUTES;
    if (overrideExpirationNumber) {
      expirationMinutes = overrideExpirationNumber;
    }
    const accessTokenExpires = moment().add(expirationMinutes, "minutes");
    const accessToken = generateToken(user, accessTokenExpires, tokenTypes.ACCESS);

    if (ignoreRefreshToken) {
      return accessToken;
    }
    // refresj tokens
    const refreshTokenExpires = moment().add(process.env.REFRESH_EXPIRATION_DAYS, "days");
    const refreshToken = generateToken(user, accessTokenExpires, tokenTypes.ACCESS);
    await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate()
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate()
      }
    };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const verifyToken = async (token, type) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tokenDocument = await Token.findOne({ user: decoded.id, token, type, isBlackListed: false });
    if (!tokenDocument) {
      throw new Error("Token not found");
    }
    return tokenDocument;
  } catch (error) {
    console.log(error);
    throw new Error("Could not verify token. An error was encountered with the following details: " + error.message);
  }
};

export const generateResetPasswordToken = async email => {
  try {
    const isUser = await getUserByEmail(email);
    if (!isUser) throw new Error("No user with matching email was found");
    const expires = moment().add(process.env.RESET_PASSWORD_EXPIRATION_MINUTES, "minutes");
    const resetPasswordToken = generateToken(isUser, expires, tokenTypes.RESET_PASSWORD)
    await saveToken(resetPasswordToken, isUser._id, expires, tokenTypes.RESET_PASSWORD)
    return resetPasswordToken
  } catch (error) {
    console.log(error);
  }
};

export const generateVerifyEmailToken = async email => {
    try {
      const isUser = await getUserByEmail(email);
      if (!isUser) throw new Error("No user with matching email was found");
      const expires = moment().add(process.env.VERIFY_EMAIL_EXPIRATION_MINUTES, "minutes");
      const verifyEmailToken = generateToken(isUser, expires, tokenTypes.VERIFY_EMAIL)
      await saveToken(verifyEmailToken, isUser._id, expires, tokenTypes.VERIFY_EMAIL)
      return verifyEmailToken
    } catch (error) {
      console.log(error);
    }
};