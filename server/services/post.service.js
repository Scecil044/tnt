import { response } from "express";
import Post from "../models/Post.model.js";
import { getUserById } from "./user.service.js";
import { v2 as cloudinary } from "cloudinary";

export const getPostById = async postId => {
  try {
    return await Post.findOne({ isDeleted: false, _id: postId }).populate({
      path: "User",
      select: "firstName lastName userName email"
    }).populate({
        path:"comments",
        match:{isDeleted:false},
        populate:{
            path:"User",
            select: "firstName lastName userName email"
        }

    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const createNewPost = async (text, image, userId) => {
  try {
    const isUser = await getUserById(userId);
    if (isUser) throw new Error("user not found");
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      image = uploadResponse.secure_url;
    }
    // create new post
    const newPost = Post.create({
      text,
      image,
      user: userId
    });
    if (!newPost) throw new Error("Could not create post");
    const createdPost = await getPostById(newPost._id);
    return createdPost;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const commentOnPost = async (text, userId, postId) => {
  try {
    const isPost = await getPostById(postId)
    if(!isPost) throw new Error("Post not found")
    const commentBody = {user:userId, text}
    isPost.comments.unshift(commentBody)
    await isPost.save()
    return isPost
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const discardPost = async (postId, userId) => {
  try {
    const isPost = await getPostById(postId);
    if (!isPost) throw new Error(`No post with matching id ${postId} was found`);
    if (isPost.user.toString() !== postId.toString()) throw new Error("You are not authorized to delete this post");
    if (isPost.image) {
      imageId = isPost.image
        .split("/")
        .pop()
        .split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }
    isPost.isDeleted = true;
    await isPost.save();
    return isPost;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
