import express from "express"
import { addComment, createPost, deletePost, likeAndUnlikePost } from "../controllers/posts.controller.js"

const router = express.Router()


router.post("/", createPost)
router.put("/like/:postId", likeAndUnlikePost)
router.post("/comment/:postId", addComment)
router.delete("/delete/:postId", deletePost)

export default router