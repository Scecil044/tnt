import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import colors from "colors"
import appRoutes from "./routes/index.js"
import { connectDb } from "./config/DB.js"
import { v2 as cloudinary } from "cloudinary"


dotenv.config()
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors())
app.use(cookieParser())
app.use(helmet())

const PORT = process.env.PORT || 5500

//app routes 
app.use("/api/v1", appRoutes)


// error middleware
app.use((err, req,res,next)=>{
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal server error"

    res.status(statusCode).json({
        success:false,
        statusCode,
        message
    })
})


app.listen(PORT, ()=>{
    console.log(`App running on http://localhost:${PORT}`.red.underline)
    connectDb()
})