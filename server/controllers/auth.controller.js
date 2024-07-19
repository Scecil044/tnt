import { login, logoutUser, signUpUser } from "../services/auth.service.js"
import { errorHandler } from "../utils/errorHandler.js"


export const signUp = async(req, res, next) => {
    try {
        const {email} = req.body
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        const requiredFields = ["email", "password", "firstName", "lastName", "role"]
        const missingFields = requiredFields.filter((field)=> !req.body[field])
        if(missingFields.length > 0) return next(errorHandler(400, `Please provide the required fields: ${missingFields.join(",")}`))
        if(!emailRegex.test(email)){
            return next(errorHandler(400, "Invalid email address!"))
        }
        const response = await signUpUser(req.body, res)
        if(!response) return next(errorHandler(400, "Sign up failled!"))
        res.status(201).json(response)
    } catch (error) {
        console.log("an error was encountered when attempring to sign up user")
        next(error)
    }
}

export const signIn = async(req,res,next)=>{
    try {
        const requiredFields = ["email", "password"]
        const missingFields = requiredFields.filter((field)=> !req.body[field])
        if(missingFields.length > 0) return next(errorHandler(400, `Please provide the required fields: ${missingFields.join(",")}`))
        const response = await login(req.body, res)
        if(!response) throw new Error("Could not authenticate")
            res.status(200).json(response)
    } catch (error) {
        next(error)
    }
}

export const signOut = async(req,res,next) => {
    try {
        const response = await logoutUser(res)
        if(!response) return next(errorHandler(400, "Logout failled"))
        res.status(200).json("Logout successful")
    } catch (error) {
        next(error)
    }
}