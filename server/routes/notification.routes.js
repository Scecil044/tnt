import express from "express"
import { filterNotifications } from "../controllers/notifications.controller.js"
import { verifyToken } from "../utils/verifyToken.js"

const router = express.Router()

router.get("/filter",verifyToken, filterNotifications)

export default router