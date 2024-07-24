import express from "express"
import { filterSystemLogs } from "../controllers/logs.controller.js"

const router = express.Router()

router.get("/filter", filterSystemLogs)

export default router