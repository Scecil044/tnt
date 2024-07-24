import express from "express"
import { forgotUserPassword, loginUser, refreshAuthTokens, resetPassword, signIn, signOut, signUp } from "../controllers/auth.controller.js"
import { authLimitter, commonLimitter } from "../config/rateLimit.js"

const router = express.Router()

router.post("/register",authLimitter, signUp)
router.post("/login",authLimitter, signIn)
//login with refresh tokens
router.post("/validate/login",authLimitter, loginUser)
router.get("/logout",authLimitter, signOut)
router.post("/refresh/token",authLimitter, refreshAuthTokens)
router.post("/forgot/password",commonLimitter, forgotUserPassword)
router.put("/reset/password",commonLimitter, resetPassword)

export default router