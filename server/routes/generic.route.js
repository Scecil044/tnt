import express from "express"
import { verifyToken } from "../utils/verifyToken.js"
import { genericAppFilter } from "../controllers/generic.controller.js"

const router = express.Router()

router.get("/filter", genericAppFilter )


export default router