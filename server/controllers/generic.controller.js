import { genericfilter } from "../services/generic.service.js"
import { errorHandler } from "../utils/errorHandler.js"


export const genericAppFilter = async(req,res,next)=>{
    try {
        const response = await genericfilter(req.query, req.body)
        if(!response) return next(errorHandler(400, `could not filter from ${req.body.module}`))
        res.status(200).json(response)
    } catch (error) {
        next(error)
    }
}