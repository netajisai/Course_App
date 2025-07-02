import express from 'express'
import { userSignup, userSignin} from '../controllers/userController.js'

// Router connection
const router = express.Router()

// User Routes
router.post('/signup', userSignup)
router.post('/signin', userSignin)


export default router;