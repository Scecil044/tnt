import { tokenTypes } from "../config/token.js";
import Token from "../models/Token.model.js";
import User from "../models/User.model.js";
import { generateAuthToken } from "../utils/generateAuthToken.js";
import { notifyUsers } from "./notification.service.js";
import { getRoleByName } from "./role.service.js";
import { generateAuthTokens, verifyToken } from "./token.service.js";
import { getUserByCredentials, getUserByEmail, getUserById } from "./user.service.js";

export const signUpUser = async (formData, res) => {
  try {
    console.log(formData);
    // check if user exists
    const isUser = await getUserByEmail(formData.email);
    if (isUser) throw new Error("The email entered has been blacklisted or is already taken");
    // function to generate userName
    const generateUserName = length => {
      const letters = "abcdefghijklmnopqstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ02316789";
      let randomString = "";
      for (let i = 0; i < length; i++) {
        randomString += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      return randomString;
    };
    const userName = generateUserName(10);
    const systemRole = await getRoleByName(formData.role.toLowerCase());
    if (!systemRole) throw new Error("Invalid selection for path role");
    const newUser = await User.create({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      userName: formData.firstName + userName,
      password: formData.password,
      role: systemRole._id
    });
    generateAuthToken(newUser, res);
    const userObject = newUser.toObject();
    delete userObject.password;
    // notify administrators
    let roleToNofity = "admin"
    await notifyUsers(roleToNofity, newUser)
    return userObject;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// This is the function currently being user to login
export const login = async (formData, res) => {
  try {
    const { email, password } = formData;
    const isUser = await getUserByEmail(email);
    if (!isUser) throw new Error("Invalid credentials");
    const isPassword = await isUser.comparePassword(password);
    if (!isPassword) throw new Error("Invalid credentials!");
    generateAuthToken(isUser, res);
    const user = await User.findById(isUser._id).select("-password");
    return user;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const authenticate = async (email, password) => {
  try {
    const user = getUserByCredentials(email, password);

    if (user) {
      const token = await user.generateAuthTokens();

      let response = {
        token,
        user
      };
      return response;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const logoutUser = async res => {
  try {
    return res.cookie("access_token", "", { maxAge: 0 });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// Refresh auth tokens
export const refreshAuth = async refreshToken => {
  try {
    const tokenFromDb = await verifyToken(refreshToken, tokenTypes.REFRESH);
    const isUser = await User.findOne({ _id: tokenFromDb.user, isDeleted: false });
    if (!isUser) throw new Error("User not found!!");
    return await generateAuthTokens(isUser);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// function to reset user password by provided reset token
export const resetUserPassword = async (token, newPassword) => {
  try {
    const tokenDoc = await verifyToken(token, tokenTypes.RESET_PASSWORD);
    const isUser = await getUserById(tokenDoc.user);
    if (!isUser) {
      throw new Error(`Could not find user with provided id: ${tokenDoc.user}`);
    }
    isUser.password = newPassword;
    await isUser.save();

    await Token.deleteMany({ user: isUser._id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    console.log(error);
    throw new Error("unable to reset password " + error.message);
  }
};
