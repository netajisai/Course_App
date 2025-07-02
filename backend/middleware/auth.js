import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

// JWT SECRETS
const ADMIN_SECRET = process.env.JWT_ADMIN_SECRET
const USER_SECRET = process.env.JWT_USER_SECRET

export async function adminAuth(req, res, next){
    const token = req.headers.token
    console.log(`Admin token:${token}`)
    if(!token){
        return res.status(401).json({
            message: "Token missing - Unauthorized"
        })
    }
    
    jwt.verify(token, ADMIN_SECRET, (err, data)=>{
        console.log(`Error:${err}`)
        console.log(`Data:${data}`)
        if(err){
            res.status(401).json({
                message: `Token is invalid:${err}`
            })
        }else if(data.id){
            req.tokenId = data.id
            next()
        }else{
            res.status(404).json({
                message: "User not logged in"
            })
        }
    })
    
}

export async function userAuth(req, res, next){
    const token = req.headers.token
    console.log(`User token:${token}`)
    if(!token){
        return res.status(401).json({
            message: "Token missing - Unauthorized"
        })
    }
    
    jwt.verify(token, USER_SECRET, (err, data)=>{
        console.log(`Error:${err}`)
        console.log(`Data:${data}`)
        if(err){
            res.status(401).json({
                message: `Token is invalid:${err}`
            })
        }else if(data.id){
            req.tokenId = data.id
            next()
        }else{
            res.status(404).json({
                message: "User not logged in"
            })
        }
    })
    
}