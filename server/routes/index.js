import {Router} from "express"
import authRoutes from "./auth.routes.js"
import userRoutes from "./user.routes.js"
import roleRoutes from "./role.routes.js"
import genericRoutes from "./generic.route.js"
import postRoutes from "./post.routes.js"

const router = Router()

router.use("/users", userRoutes)
router.use("/auth", authRoutes)
router.use("/roles", roleRoutes)
router.use("/generic", genericRoutes)
router.use("/posts", postRoutes)

export default router