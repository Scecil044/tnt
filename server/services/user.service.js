import User from "../models/User.model.js";
import { createNotification } from "./sotification.service.js";
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary";

export const getUserById = async userId => {
  try {
    return await User.findOne({ _id: userId, isDeleted: false }).select("-password");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const getUserByEmail = async email => {
  try {
    return await User.findOne({ email, isDeleted: false });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const getSystemUsers = async reqQuery => {
  try {
    const searchRegex = reqQuery.search ? new RegExp(reqQuery.search, "i") : null;
    const query = {
      isDeleted: false
    };
    if (searchRegex) {
      query.$or = [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }];
    }

    const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 100;
    const sortOrder = reqQuery.sortOrder ? parseInt(reqQuery.sortOrder) : -1;
    const sortBy = reqQuery.sortBy || "createdAt";

    // const options = {
    //   skip: (page - 1) * limit,
    //   limit,
    //   sort: { [sortBy]: sortOrder }
    // };
    // return await User.find(query)
    //   .select("-password")
    //   .skip(options.skip)
    //   .limit(options.limit)
    //   .sort(options.sort);
    const filter ={
      isDeleted:false,
    }
    const options ={
      page:reqQuery.page ? parseInt(reqQuery.page) : 1,
      limit:reqQuery.limit ? parseInt(reqQuery.limit) : 70,
      sortOrder: reqQuery.sortOrder ? parseInt(reqQuery.sortOrder) : -1,
      sortBy:reqQuery.sortBy || "createdAt",
      sort: {[sortBy]:sortOrder},
      select:"-password"
    }
    return await User.paginate(filter, options)
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const follow = async (userId, authenticatedId) => {
  try {
    console.log(userId, "id from params");
    console.log(authenticatedId);
    const userToFollowOrUnfollow = await getUserById(userId);
    const currentUser = await getUserById(authenticatedId);

    if (!currentUser || !userToFollowOrUnfollow) throw new Error("user not found");
    if (currentUser._id.equals(userToFollowOrUnfollow._id)) throw new Error("You cannot follow your account");
    const isFollowing = currentUser.following.includes(userToFollowOrUnfollow._id);

    if (isFollowing) {
      //unfollow user
      await User.findByIdAndUpdate(userToFollowOrUnfollow._id, { $pull: { followers: currentUser._id } }, { new: true });
      await User.findByIdAndUpdate(currentUser._id, { $pull: { following: userToFollowOrUnfollow._id } }, { new: true });
      return "user unfolowed successfuly";
    } else {
      //follow user
      await User.findByIdAndUpdate(currentUser._id, { $push: { following: userToFollowOrUnfollow._id } }, { new: true });
      await User.findByIdAndUpdate(userToFollowOrUnfollow._id, { $push: { followers: currentUser._id } }, { new: true });
      //create notification
      const notificationBody={
        from:currentUser._id,
        to:userToFollowOrUnfollow._id,
        type:"follow"
      }
      const userNotification = await createNotification(notificationBody)
      if(!userNotification) throw new Error("Could not create notification")
      return "User followed successfully";
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
/**
 * 
 * Function to get suggested users
 */
export const getSuggestedUsers = async userId => {
  try {
    const myFollowers = await User.findById(userId).select("following"); // people followed by the authenticated user
    console.log(myFollowers,"my followers")
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }
        }
      },
      { $sample: { size: 10 } }
    ]);
    const filteredUsers = users.filter(user => !myFollowers.following.includes(user._id));
    const suggestedusers = filteredUsers.slice(0, 4);
    suggestedusers.forEach(user => (user.password = null));
    return suggestedusers
  } catch (error) {
    throw new Error(error)
  }
};

export const updateUserDetails = async(reqBody, userId)=>{
  try {
    console.log(reqBody)
    const user = await User.findById(userId).where({isDeleted:false})
    const {password, currentPassword, profilePicture, coverPhoto} = reqBody
    // check if passwords exist in reqBody
    if((currentPassword && !password ) || (password && !currentPassword)) throw new Error("Plese provide your current and new password")
    if(currentPassword && password){
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if(!isMatch) throw new Error("Please enter your valid password")
      }
    const updates = Object.keys(reqBody)
    updates.forEach((update)=>{
      user[update] = reqBody[update]
    })
    if(profilePicture){
      const data =await cloudinary.uploader.upload(profilePicture)
      const profileImgLink = data.secure_url
      user.profilePicture = profileImgLink
    }
    if(coverPhoto){
      const data =await cloudinary.uploader.upload(coverPhoto)
      const coverImgLink = data.secure_url
      user.coverPhoto = coverImgLink
    }
    await user.save()
    const userObject = user.toObject()
    delete userObject.password
    return userObject
  } catch (error) {
    throw new Error(error)
  }
}