import { getRoleById, getRoleByName, getSystemRoles, storeRole } from "../services/role.service.js"
import { errorHandler } from "../utils/errorHandler.js"

export const createRole = async(req,res,next) =>{
    try {
        //check for required fields
        const requiredFields = ["roleName"]
        const missingFields = requiredFields.filter((field)=> !req.body[field])
        // throw an error if missing fields is true
        if(missingFields.length > 0) return next(errorHandler(400, `Please provide the required fields: ${missingFields.join(", ")}`))
        const response = await storeRole(req.body)
        if(!response) return next(errorHandler(400, "Unable to save role"))
        res.status(201).json(response)
    } catch (error) {
        console.log("An error ocurred when creating role", error)
        next(error)
    }
}

export const getRoles = async(req,res,next)=>{
    try {
        const response = await getSystemRoles(req.query)
        if(!response) return next(errorHandler(400, "Could not list system roles"))
        res.status(200).json(response)
    } catch (error) { 
        console.log(error)
        next(error)
    }
}

export const findRoleById = async(req,res,next) =>{
    try {
        const response = await getRoleById(req.params.roleId)
        res.status(200).json(response)
    } catch (error) {
        console.log("An error ocurred when accessing role by id", error)
        next(error)
    }
}

export const findRoleByName = async(req,res,next) =>{
    try {
        const response = await getRoleByName(req.query.roleName)
        res.status(200).json(response)
    } catch (error) {
        console.log("An error ocurred when accessing role by name", error)
        next(error)
    }
}

export const updateRole = async(req,res,next) =>{
    try {
        
    } catch (error) {
        console.log("An error ocurred when updating role", error)
        next(error)
    }
}

export const deleteRole = async(req,res,next) =>{
    try {
        
    } catch (error) {
        console.log("An error ocurred when deleting role", error)
        next(error)
    }
}

