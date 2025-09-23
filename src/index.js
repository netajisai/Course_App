import express from 'express'
import cors from 'cors'
import adminRoutes from './routes/adminRoutes.js'
import userRoutes from './routes/userRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import setupGraphQL from './graphql/index.js'

const app = express()
// Middleware
app.use(express.json())
app.use(cors())

// Admin Routes
app.use('/api/v1/admin', adminRoutes)
// User Routes
app.use('/api/v1/user', userRoutes)
// Course Routes
app.use('/api/v1/course', courseRoutes)

// GraphQL (initialized in server.js after DB connection)
export async function initApp(){
    await setupGraphQL(app)
    return app
}


export default app