import { commentOnPost, createNewPost, discardPost } from "../services/post.service.js";
import { errorHandler } from "../utils/errorHandler.js";


export const createPost = async(req,res,next)=>{
    try {
        const {text, image} = req.body
        const userId = req.params.userId
        if(!text && !image) return next(errorHandler(400, "A post must have an image or an accompanying text"))
        const response = await createNewPost(test, image, userId)
        if(!response) return next(errorHandler(400, "could not create post"))
        res.status(201).json(response)
    } catch (error) {
        next(error)
    }
}

export const likeAndUnlikePost = async(req,res,next)=>{
    try {
        
    } catch (error) {
        next(error)
    }
}

export const addComment = async(req,res,next)=>{
    try {
        const {text} = req.body
        const postId = req.params.postId
        const userId = req.user.id
        if(!text) return next(errorHandler(400, "the text field is required"))
        const response = await commentOnPost(text, userId, postId)
    if(!response) return next(errorHandler(400, "could not create comment"))
        res.status(201).json(response)
    } catch (error) {
        next(error)
    }
}

export const deletePost = async(req,res,next)=>{
    try {
        const postId = req.params.postId
        const response = await discardPost(postId)
        if(!response) return next(errorHandler(400, "could not delete post"))
        res.status(200).json("Post deleted")
    } catch (error) {
        next(error)
    }
}