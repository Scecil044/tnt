import Notification from "../models/Notification.model.js"

export const createNotification = async(notificationBody)=>{
    try {
        const newNotification = await Notification.create({
            from:notificationBody.from,
            to:notificationBody.to,
            type:notificationBody.type
        })
        return newNotification
    } catch (error) {
        throw new Error(error)
    }
}