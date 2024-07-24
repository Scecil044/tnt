import { filterSystemNotifications } from "../services/notification.service.js";
import { errorHandler } from "../utils/errorHandler.js";

export const getMyNotifications = async(req,res,next)=>{
    try {
        
    } catch (error) {
        next(error)
    }
}

export const filterNotifications = async(req,res,next)=>{
    try {
        const response = await filterSystemNotifications(req.query)
        if(!response) return next(errorHandler(400, "Could not filter notifications"))
        res.status(200).json(response)
    } catch (error) {
        next(error)
    }
}