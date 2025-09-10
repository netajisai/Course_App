import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { AdminModel } from '../models/db.js'
import { signup_schema, signin_schema } from '../schemas/schema.js'

dotenv.config()
// JWT Secret
const SECRET = process.env.JWT_ADMIN_SECRET

export async function adminSignup(req, res, next){
    // validate request with zod
    const parsedData = signup_schema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({
            message: "Incorrect payload",
            error: parsedData.error
        })
    }
    const {username, password, name} = parsedData.data // ✅ use parsed data
    try{
        // Check if user already exists
        const existing_user = await AdminModel.findOne({ username })
        if(existing_user){
            return res.status(409).json({
                message: `Admin user:${username} already signed up`
            })
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)
        // create a new admin
        const admin = await AdminModel.create({
            username,
            password: hashedPassword,
            name
        })
        res.status(201).json({
            message: `Admin ${name} signed up successfully.`,
            adminId: admin._id
        })
    }catch(err){
        console.log(`Error during signup:${err}`)
        // Duplicate key error from Mongo DB
        if(err.code == 11000){
            return res.status(409).json({
                message: `Admin user ${username} already exists (DB unique index)`
            })
        }
        // Generic Error
        res.status(500).json({
            message: `Error during signup:${err}`
        })
    }
}

export async function adminSignin(req, res, next){
    // validate payload
    const parsedData = signin_schema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({
            message: "Incorrect payload",
            error: parsedData.error
        })
    }
    const {username, password}=parsedData.data
    try{
        // check if admin exists
        const admin = await AdminModel.findOne({ username })
        if(!admin){
            return res.status(401).json({
                message: "Invalid username"
            })
        }
        const pwdMatch = await bcrypt.compare(password, admin.password)
        if(!pwdMatch){
            return res.status(401).json({
                message: "Invalid password"
            })
        }
        // Generate JWT
        const token = jwt.sign({
            id:admin._id.toString()
        }, SECRET)
        // const token = jwt.sign(
        //     { id: admin._id.toString(), role: "admin" }, // ✅ add role for RBAC
        //     SECRET,
        //     { expiresIn: "1h" } // ✅ token expiry
        // );
        res.json({
           message: `Admin ${username} logged in successfully`,
            token
        })
    }catch(err){
        console.log(`Error during signin: ${err}`)
        res.status(500).json({
            message: `Error during signup:${err}`
        })
    }
}