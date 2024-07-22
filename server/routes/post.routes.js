import express from "express"
import { addComment, createPost, deletePost, getPost, likeAndUnlikePost } from "../controllers/posts.controller.js"
import { verifyToken } from "../utils/verifyToken.js"

const router = express.Router()


router.get("/:postId",verifyToken, getPost)
router.post("/create",verifyToken, createPost)
router.put("/like/:postId",verifyToken, likeAndUnlikePost)
router.put("/comment/:postId",verifyToken, addComment)
router.delete("/delete/:postId", deletePost)

export default router