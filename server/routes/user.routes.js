import express from "express"
import { followUserAndUnfollowUser, getUser, getUsers, suggestedUsers, updateCurrentUser } from "../controllers/users.controller.js"
import { verifyToken } from "../utils/verifyToken.js"

const router = express.Router()

router.get("/:userId",verifyToken, getUser)
router.get("/", verifyToken, getUsers)
router.get("/suggested/followers", verifyToken, suggestedUsers)
router.get("/follow/:userId",verifyToken, followUserAndUnfollowUser)
router.put("/:userId", updateCurrentUser)

export default router