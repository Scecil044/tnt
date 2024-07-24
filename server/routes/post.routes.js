import express from "express"
import { addComment, createPost, deletePost, filterSystemPosts, getFollowersPosts, getLikedPosts, getMyPosts, getPost, getPostByUserName, likeAndUnlikePost } from "../controllers/posts.controller.js"
import { verifyToken } from "../utils/verifyToken.js"

const router = express.Router()


router.get("/:postId",verifyToken, getPost)
router.get("/my/posts",verifyToken, getMyPosts)
router.get("/followers/posts",verifyToken, getFollowersPosts)
router.get("/liked/:userId",verifyToken, getLikedPosts)
router.get("/filter/posts",verifyToken, filterSystemPosts)
router.get("/by/user/name",verifyToken, getPostByUserName)
router.post("/create",verifyToken, createPost)
router.put("/like/:postId",verifyToken, likeAndUnlikePost)
router.put("/comment/:postId",verifyToken, addComment)
router.delete("/delete/:postId", deletePost)

export default router