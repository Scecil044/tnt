import { authenticate, login, logoutUser, refreshAuth, resetUserPassword, signUpUser } from "../services/auth.service.js";
import { sendResetPasswordEmail } from "../services/email.service.js";
import { generateResetPasswordToken } from "../services/token.service.js";
import { errorHandler } from "../utils/errorHandler.js";

export const signUp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const requiredFields = ["email", "password", "firstName", "lastName", "role"];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0)
      return next(errorHandler(400, `Please provide the required fields: ${missingFields.join(",")}`));
    if (!emailRegex.test(email)) {
      return next(errorHandler(400, "Invalid email address!"));
    }
    const response = await signUpUser(req.body, res);
    if (!response) return next(errorHandler(400, "Sign up failled!"));
    res.status(201).json(response);
  } catch (error) {
    console.log("an error was encountered when attempring to sign up user");
    next(error);
  }
};

// This is the function currently being used
// it does not, however, provide refresh tokens
export const signIn = async (req, res, next) => {
  try {
    const requiredFields = ["email", "password"];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0)
      return next(errorHandler(400, `Please provide the required fields: ${missingFields.join(",")}`));
    const response = await login(req.body, res);
    if (!response) throw new Error("Could not authenticate");
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async(req,res,next)=>{
  try {
    const requiredFields = ["email", "password"];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0)
      return next(errorHandler(400, `Please provide the required fields: ${missingFields.join(",")}`));
    const loginData = await authenticate(req.body.email, req.body.password)
  if(!loginData) return next(errorHandler(400, "unable to login with the provided credentials"))
    res.status(200).json(loginData)
  } catch (error) {
    next(error)
  }
}


//  controller function to refresh auth tokens
export const refreshAuthTokens = async (req, res, next) => {
  try {
    const {refreshToken} = req.body
    if(!refreshToken) return next(errorHandler(400, "The refresh token field is required!"))
    const token = await refreshAuth(refreshToken);
    if (!token) return next(errorHandler(400, "Could not generate refresh token"));
    res.status(200).json(token);
  } catch (error) {
    next(error);
  }
};

export const forgotUserPassword = async (req, res, next) => {
  try {
    if (!req.body.email) return next(errorHandler(400, "The email field is required"));
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(req.body.email)) {
      return next(errorHandler(400, "Invalid email address!"));
    }
    const forgotPasswordToken = await generateResetPasswordToken(req.body.email);
    await sendResetPasswordEmail(req.body.email, forgotPasswordToken);
    res.status(200).json("Reset email sent");
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async(req,res,next)=>{
  try {
    const requiredFields = ["resetPasswordToken", "newPassword"]
    const missingFields = requiredFields.filter((field) => !req.body[field])
    if(missingFields.length >0) return next(errorHandler(400, `Please provide the required fields: ${missingFields.join(", ")}`))

      const response = await resetUserPassword(req.body.resetPasswordToken, req.body.newPassword)
      res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const signOut = async (req, res, next) => {
  try {
    const response = await logoutUser(res);
    if (!response) return next(errorHandler(400, "Logout failled"));
    res.status(200).json("Logout successful");
  } catch (error) {
    next(error);
  }
};
