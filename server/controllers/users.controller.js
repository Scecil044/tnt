import { createLog } from "../services/log.service.js";
import { follow, getSuggestedUsers, getSystemUsers, getUserById, updateUserDetails } from "../services/user.service.js";
import { errorHandler } from "../utils/errorHandler.js";
import { logger } from "../utils/winstonLogger.js";

export const getUser = async(req,res,next)=>{
    try {
        const response = await getUserById(req.params.userId)
        if(!response) return next(errorHandler(400, "could not find user by the provided id"))
        const logString = logger.info(`${req.user.firstName} ${req.user.lastName} Accessed get user route`).transports[0].logString
        await createLog("Users", req.user._id, logString)
        res.status(200).json(response)
    } catch (error) {
        console.log(error.mesage)
        // const logString = logger.error(`${req.user.firstName} ${req.user.lastName} Failed to Access get User route, encountered following error => ${error}`)
        // .transports[0].logString;
        // await createLog('users', req.user._id, logString);
        next(error)
    }
}
export const getUsers = async(req,res,next)=>{
    try {
        const response = await getSystemUsers(req.query)
        if(!response) return next(errorHandler(400, "could not list system users"))
        res.status(200).json(response)
    } catch (error) {
        console.log(error.mesage)
        next(error)
    }
}

export const updateCurrentUser = async(req,res,next)=>{
    try {
        console.log(req.user, "the user")
        const response = await updateUserDetails(req.body, req.params.userId, req.user)
        if(!response) return next(errorHandler(400, "could not update user details"))
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

export const followUserAndUnfollowUser = async(req,res,next)=>{
    try {
        const {userId} = req.params
        const response = await follow(userId, req.user._id)
        if(!response) return next(errorHandler(400, "could not follow user"))
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}
export const suggestedUsers = async(req,res,next)=>{
    try {
        const response = await getSuggestedUsers(req.user._id)
        if(!response) return next(errorHandler(400, "could not get suggested followreser"))
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}