import Post from "../models/Post.model.js";
import { getUserById, removePostIdFromLikedPosts } from "./user.service.js";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import User from "../models/User.model.js";
import { errorHandler } from "../utils/errorHandler.js";

export const getPostById = async postId => {
  try {
    return await Post.findOne({ isDeleted: false, _id: postId })
      .populate({
        path: "user",
        select: "firstName lastName userName email"
      })
      .populate({
        path: "comments",
        match: { isDeleted: false },
        populate: {
          path: "user",
          select: "firstName lastName userName email"
        }
      });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const getPostsByUsersName = async reqQuery => {
  try {
    const {page =1, limit =10, sort = "createdAt", sortBy= "desc", search} = reqQuery
    console.log(search)
    const skip = (page-1)* limit
    const pipeline = [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $lookup: {
          from: "roles",
          localField: "userDetails.role",
          foreignField: "_id",
          as: "roleDetails"
        }
      },
      { $unwind: "$roleDetails" },
    ];

    if(search){
      const searchRegex = new RegExp(search, "i")
      pipeline.push({
        $match:{
          "userDetails.userName":{$regex:searchRegex}
        }
      })
    }

    pipeline.push({
      $project: {
        createdAt:1,
        updatedAt:1,
        text:1,
        likes:{$size:"$likes"},
        comments:{$size:"$comments"},
        _id:1,
        user:{
          firstName:"$userDetails.firstName",
          lastName:"$userDetails.lastName",
          email:"$userDetails.email",
          userName:"$userDetails.userName",
          role:"$roleDetails.roleName"
        }
      }
    },
    {
      $sort:{[sort]: sortBy === "desc" ? -1 :1}
    }
  );
    const response = await Post.aggregate(pipeline);
    return response
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
    const isPost = await getPostById(postId);
    if (!isPost) throw new Error("Post not found");
    const commentBody = { user: userId, text };
    isPost.comments.unshift(commentBody);
    await isPost.save();
    return isPost;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const likePost2 = async (postId, userId) => {
  try {
    const isUser = await getUserById(userId);

    const isPost = await getPostById(postId);
    if (!isPost) throw new Error("Could not find post by id");

    // Convert userId to ObjectId for comparison
    const userIdObject = new ObjectId(userId);
    const isLikedPost = isPost.likes.some(like => like.equals(userIdObject));

    if (isLikedPost) {
      isUser.likedPosts.pull(isPost._id);
      isUser.markModified("likedPosts");
      await isUser.save();
      // Unlike post
      isPost.likes.pull(userIdObject); // Using Mongoose's pull method for arrays
      isPost.markModified("likes"); // Mark the likes array as modified
      await isPost.save(); // Save the updated post

      return isPost;
    } else {
      // Like post
      isUser.likedPosts.unshift(isPost._id);
      isUser.markModified("likedPosts");
      await isUser.save();
      isPost.likes.push(userIdObject); // Use push to add the userId
      isPost.markModified("likes"); // Mark the likes array as modified
      await isPost.save(); // Save the updated post
      return isPost;
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const likePost = async (postId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const post = await Post.findById(postId).session(session);
    if (!post) {
      throw new Error("Post not found");
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    const isLikedPost = post.likes.includes(userId);

    if (isLikedPost) {
      // Unlike post
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true, session });
      await User.findByIdAndUpdate(userId, { $pull: { likedPosts: postId } }, { session });
    } else {
      // Like post
      await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true, session });
      await User.findByIdAndUpdate(userId, { $addToSet: { likedPosts: postId } }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return await Post.findById(postId);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in likePostTwo:", error);
    throw error;
  }
};

export const discardPost = async (postId, userId) => {
  try {
    const isPost = await getPostById(postId);
    if (!isPost) throw new Error(`No post with matching id ${postId} was found`);
    if (isPost.user.toString() !== isPost.user.toString()) throw new Error("You are not authorized to delete this post");
    if (isPost.image) {
      imageId = isPost.image
        .split("/")
        .pop()
        .split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }
    const response = await removePostIdFromLikedPosts(isPost._id);
    if (!response) throw new Error("unable to remove post from likedposts array");
    isPost.likes = [];
    isPost.isDeleted = !isPost.isDeleted;
    await isPost.save();
    return isPost;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const getUsersLikedPosts = async userId => {
  try {
    const isUser = await getUserById(userId);
    if (!isUser) return errorHandler(400, "user not found");
    const posts = await Post.find({ isDeleted: false, _id: { $in: isUser.likedPosts } })
      .populate({
        path: "user",
        select: "firstName lastName email"
      })
      .populate({
        path: "comments.user",
        select: "-password"
      });
    return posts;
  } catch (error) {
    console.log(error);
    throw new Error("Could not get liked posts, An error ocurred with the following details: " + error.message);
  }
};

export const filterPosts = async reqQuery => {
  try {
    let pipeline = [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $lookup: {
          from: "roles",
          localField: "userDetails.role",
          foreignField: "_id",
          as: "roleDetails"
        }
      },
      {
        $unwind: "$roleDetails"
      }
    ];

    if (reqQuery.search) {
      const searchRegex = new RegExp(reqQuery.search, "i");
      pipeline.push({
        $match: {
          $or: [
            { text: { $regex: searchRegex } },
            { "userDetails.firstName": { $regex: searchRegex } },
            { "userDetails.lastName": { $regex: searchRegex } },
            { "userDetails.email": { $regex: searchRegex } },
            { "userDetails.userName": { $regex: searchRegex } }
          ]
        }
      });
    }

    pipeline.push(
      {
        $project: {
          _id: 1,
          text: 1,
          createdAt: 1,
          updatedAt: 1,
          likes: { $size: "$likes" },
          comments: { $size: "$comments" },
          user: {
            _id: "$userDetails._id",
            firstName: "$userDetails.firstName",
            lastName: "$userDetails.lastName",
            email: "$userDetails.email",
            userName: "$userDetails.userName",
            role: "$roleDetails.roleName"
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    );

    const response = await Post.aggregate(pipeline);
    return response;
  } catch (error) {
    console.error("Error in filterPosts:", error);
    throw error;
  }
};

export const getPostsByMe = async userId => {
  try {
    const myPosts = await Post.find({ user: userId, isDeleted: false }).populate({
      path: "comments.user",
      select: "-password"
    });
    return myPosts;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const getAllMyFollowersPosts = async userId => {
  try {
    const isUser = await getUserById(userId);
    if (!isUser) throw new Error("User not found!");
    console.log(isUser);
    const postsFromFollowers = await Post.find({ user: { $in: isUser.following } }).populate({
      path: "user",
      select: "firstName lastName email userName"
    });
    return postsFromFollowers;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};


