import mongoose from 'mongoose'

async function connectDB(MONGO_URI){
    try{
        await mongoose.connect(MONGO_URI)
        console.log("✅ Connected to MongoDB")
    }catch(err){
        console.error(`❌ DB connection failed: ${err.message}`)
        process.exit(1) // stop app if DB fails
    }
}

export default connectDB


