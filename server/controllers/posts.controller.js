import {
  commentOnPost,
  createNewPost,
  discardPost,
  filterPosts,
  getAllMyFollowersPosts,
  getPostById,
  getPostsByMe,
  getPostsByUsersName,
  getUsersLikedPosts,
  likePost
} from "../services/post.service.js";
import { errorHandler } from "../utils/errorHandler.js";

export const createPost = async (req, res, next) => {
  try {
    const { text, image } = req.body;
    const userId = req.user.id;
    if (!text && !image) return next(errorHandler(400, "A post must have an image or an accompanying text"));
    const response = await createNewPost(text, image, userId);
    if (!response) return next(errorHandler(400, "could not create post"));
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const response = await getPostById(req.params.postId);
    if (!response) return next(errorHandler(400, "could not get post"));
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getPostByUserName = async (req, res, next) => {
  try {
    console.log(req.query, "the req query")
    const response = await getPostsByUsersName(req.query);
    if (!response) return next(errorHandler(400, "could not get post by user name"));
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const likeAndUnlikePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;
    const response = await likePost(postId, userId);
    if (!response) return next(errorHandler(400, "could like post"));
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;
    const userId = req.user.id;
    if (!text) return next(errorHandler(400, "the text field is required"));
    const response = await commentOnPost(text, userId, postId);
    if (!response) return next(errorHandler(400, "could not create comment"));
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getLikedPosts = async (req, res, next) => {
  try {
    const response = await getUsersLikedPosts(req.params.userId);
    if (!response) return next(errorHandler(400, "could not fetch"));
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const response = await discardPost(postId);
    if (!response) return next(errorHandler(400, "could not delete post"));
    res.status(200).json("Post deleted");
  } catch (error) {
    next(error);
  }
};

export const filterSystemPosts = async (req, res, next) => {
  try {
    const response = await filterPosts(req.query);
    if (!response) return next(errorHandler(400, "could filter posts"));
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getMyPosts = async (req, res, next) => {
  try {
    const myposts = await getPostsByMe(req.user._id);
    if (!myposts) return next(errorHandler(400, "could not get posts"));
    res.status(200).json(myposts);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getFollowersPosts = async (req, res, next) => {
  try {
    const response = await getAllMyFollowersPosts(req.user._id);
    if (!response) return next(errorHandler(400, "Unable to fetch posts from followers"));
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
