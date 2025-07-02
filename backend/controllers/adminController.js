import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { z } from 'zod'
import { AdminModel } from '../models/db.js'

dotenv.config()
// JWT Secret
const SECRET = process.env.JWT_ADMIN_SECRET

// Zod Payload
const signup_body = z.object({
    username: z.string().email(),
    password: z.string().min(4).max(10),
    name: z.string().min(3).max(10)
})

const signin_body = z.object({
    username: z.string().email(),
    password: z.string().min(4).max(10)
})

export async function adminSignup(req, res, next){
    const {username, password, name} = req.body
    console.log(req.body)

    const parsedData = signup_body.safeParse(req.body)
    console.log(parsedData)
    if(!parsedData.success){
        return res.status(400).json({
            message: "Incorrect payload",
            error: parsedData.error
        })
    }

    try{
        const existing = await AdminModel.findOne({
            username: username
        })
        console.log(existing)
        if(existing){
            return res.status(409).json({
                message: `Admin user:${username} already signed up`
            })
        }
        const hashedPassword = await bcrypt.hash(password, 5)
        console.log(hashedPassword)
        const admin = await AdminModel.create({
            username: username,
            password: hashedPassword,
            name: name
        })

        console.log(admin)
        res.json({
            message:`Admin ${name} Signed up`
        })
    }catch(err){
        console.log(err)
        // Duplicate key error from Mongo DB
        if(err.code == 11000){
            return res.status(409).json({
                message: `Admin user ${username} already exists (DB unique index)`
            })
        }
        // Generic Error
        res.status(500).json({
            message: `Error Signing up:${err}`
        })
    }
}

export async function adminSignin(req, res, next){
    const {username, password} = req.body
    console.log(req.body)
    
    const parsedData = signin_body.safeParse(req.body)
    console.log(parsedData)
    if(!parsedData.success){
        return res.status(400).json({
            message: "incorrect payload",
            error: parsedData.error
        })
    }

    try{
        const admin = await AdminModel.findOne({
            username: username
        })
        if(!admin){
            return res.status(404).json({
                message: "Invalid username"
            })
        }
        const pwd = await bcrypt.compare(password, admin.password)
        console.log(pwd)
        if(!pwd){
            return res.status(404).json({
                message: "Invlaid Password"
            })
        }
        const token = jwt.sign({
            id:admin._id.toString()
        }, SECRET)
        console.log(token)
        res.json({
            message: `Admin ${username} logged in`,
            token
        })

    }catch(err){
        res.status(500).json({
            message: `Error during signin:${err}`
        })
    }
}