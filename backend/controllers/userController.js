import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { UserModel } from '../models/db.js'
import { signup_body, signin_body } from '../schemas/schema.js'

dotenv.config()
// JWT Secret
const SECRET = process.env.JWT_USER_SECRET


export async function userSignup(req, res, next){
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
        const existing = await UserModel.findOne({
            username: username
        })
        console.log(existing)
        if(existing){
            return res.status(409).json({
                message: `User:${username} already signed up`
            })
        }
        const hashedPassword = await bcrypt.hash(password, 5)
        console.log(hashedPassword)
        const user = await UserModel.create({
            username: username,
            password: hashedPassword,
            name: name
        })

        console.log(user)
        res.json({
            message:`User ${name} Signed up`
        })
    }catch(err){
        console.log(err)
        // Duplicate key error from Mongo DB
        if(err.code == 11000){
            return res.status(409).json({
                message: `User ${username} already exists (DB unique index)`
            })
        }
        // Generic Error
        res.status(500).json({
            message: `Error Signing up:${err}`
        })
    }
}

export async function userSignin(req, res, next){
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
        const user = await UserModel.findOne({
            username: username
        })
        console.log(user)
        if(!user){
            return res.status(404).json({
                message: "Invalid username"
            })
        }
        const pwd = await bcrypt.compare(password, user.password)
        console.log(pwd)
        if(!pwd){
            return res.status(404).json({
                message: "Invlaid Password"
            })
        }
        const token = jwt.sign({
            id:user._id.toString()
        }, SECRET)
        console.log(token)
        res.json({
            message: `User ${username} logged in`,
            token
        })

    }catch(err){
        res.status(500).json({
            message: `Error during signin:${err}`
        })
    }
}