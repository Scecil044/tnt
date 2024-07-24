import express from "express"
import { forgotUserPassword, loginUser, refreshAuthTokens, resetPassword, signIn, signOut, signUp } from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/register", signUp)
router.post("/login", signIn)
//login with refresh tokens
router.post("/validate/login", loginUser)
router.get("/logout", signOut)
router.post("/refresh/token", refreshAuthTokens)
router.post("/forgot/password", forgotUserPassword)
router.put("/reset/password", resetPassword)

export default router