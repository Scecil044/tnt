import express from "express"
import { createRole, findRoleById, findRoleByName, getRoles } from "../controllers/roles.controller.js"
import { verifyToken } from "../utils/verifyToken.js"

const router = express.Router()

router.get("/",verifyToken, getRoles )
router.get("/role-name",verifyToken,findRoleByName )
router.post("/",verifyToken, createRole)

export default router