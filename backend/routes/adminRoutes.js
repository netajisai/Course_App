import express from 'express'
import { adminSignup, adminSignin} from '../controllers/adminController.js'
import { adminLoginLimiter } from '../middleware/rateLimiter.js';

// Router connection
const router = express.Router()

// Admin Routes
router.post('/signup', adminSignup);
router.post('/signin', adminLoginLimiter, adminSignin);

export default router;