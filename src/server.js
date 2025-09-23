import dotenv from 'dotenv'
import { initApp } from './index.js'
import connectDB from './config/db.js'

dotenv.config()
const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGODB_URI

async function startServer(){
    await connectDB(MONGO_URI)
    const app = await initApp()
    app.listen(PORT, () =>{
        console.log(`🚀 Server running on http://localhost:${PORT}`)
        console.log(`📌 GraphQL endpoint at http://localhost:${PORT}/graphql`);
    })
}

startServer()