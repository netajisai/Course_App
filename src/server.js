import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGODB_URI


async function startServer(){
    try{
        await mongoose.connect(MONGO_URI)
        console.log("Connected to DB")

        app.listen(PORT, ()=>{
            console.log(`Server running on PORT:${PORT}`)
        })
    }catch(err){
        console.error(`DB connection failed:${err}`)
        process.exit(1) // Force stop the app
    }
}
startServer()


// mongoose.connect(MONGO_URI)
//   .then(()=>{
//     console.log("Connected to DB")
//     app.listen((PORT, ()=>{
//         console.log(`Server running on port ${PORT}`)
//     }))
//   })
//   .catch(err =>{
//     console.log(`DB connection failed:${err}`)
//   })