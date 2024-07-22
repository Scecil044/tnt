
import Post from "../models/Post.model.js";
import { getUserById } from "./user.service.js";
import {ObjectId} from "mongodb"
import { v2 as cloudinary } from "cloudinary";


export const getPostById = async postId => {
  try {
    return await Post.findOne({ isDeleted: false, _id: postId }).populate({
      path: "user",
      select: "firstName lastName userName email"
    }).populate({
        path:"comments",
        match:{isDeleted:false},
        populate:{
            path:"user",
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
    if (!isUser) throw new Error("user not found");
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      image = uploadResponse.secure_url;
    }
    // create new post
    const newPost = await Post.create({
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



export const likePost = async (postId, userId) => {
  try {
    const isUser = await getUserById(userId)
    
    const isPost = await getPostById(postId);
    if (!isPost) throw new Error("Could not find post by id");

    // Convert userId to ObjectId for comparison
    const userIdObject =new ObjectId(userId);
    const isLikedPost = isPost.likes.some(like => like.equals(userIdObject));

    if (isLikedPost) {
      isUser.likedPosts.pull(isPost._id)
      isUser.markModified('likedPosts');
      await isUser.save()
      // Unlike post
      isPost.likes.pull(userIdObject); // Using Mongoose's pull method for arrays
      isPost.markModified('likes'); // Mark the likes array as modified
      await isPost.save(); // Save the updated post
    
      return isPost;
    } else {
      // Like post
      isUser.likedPosts.unshift(isPost._id)
      isUser.markModified('likedPosts');
      await isUser.save()
      isPost.likes.push(userIdObject); // Use push to add the userId
      isPost.markModified('likes'); // Mark the likes array as modified
      await isPost.save(); // Save the updated post
      return isPost;
    }
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
