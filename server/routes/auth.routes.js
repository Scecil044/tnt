import express from "express"
import { signIn, signOut, signUp } from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/register", signUp)
router.post("/login", signIn)
router.get("/logout", signOut)

export default router