import { findRoleByName } from "../controllers/roles.controller.js";
import User from "../models/User.model.js";
import { generateAuthToken } from "../utils/generateAuthToken.js";
import { getRoleByName } from "./role.service.js";
import { getUserByEmail } from "./user.service.js";

export const signUpUser = async (formData, res) => {
  try {
    console.log(formData)
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
    generateAuthToken(newUser,res);
    const userObject = newUser.toObject();
    delete userObject.password;
    return userObject;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const login = async(formData, res)=>{
    try {
        const {email, password} = formData
        const isUser = await getUserByEmail(email)
        if(!isUser) throw new Error("Invalid credentials")
        const isPassword = await isUser.comparePassword(password)
        if(!isPassword) throw new Error("Invalid credentials!")
        generateAuthToken(isUser, res)
        const user = await User.findById(isUser._id).select("-password")
        return user
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

export const logoutUser = async(res)=>{
    try {
        return res.cookie("access_token","", {maxAge:0})
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}