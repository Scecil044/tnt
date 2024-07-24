import { filterLogs } from "../services/log.service.js"
import { errorHandler } from "../utils/errorHandler.js"

export const filterSystemLogs = async(req,res,next)=>{
    try {
        const response = await filterLogs(req.query)
        if(!response) return errorHandler(400,"Could not fetch logs")
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}