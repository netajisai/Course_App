import express from 'express'
import { adminSignup, adminSignin} from '../controllers/adminController.js'

// Router connection
const router = express.Router()

// Admin Routes
router.post('/signup', adminSignup);
router.post('/signin', adminSignin);

export default router;