import express from 'express'
import { adminSignup1, adminSignin1, admin } from '../controllers/adminController.js'
import { adminLoginLimiter } from '../middleware/rateLimiter.js';

// Router connection
const router = express.Router()

// Admin Routes
// router.post('/signup', adminSignup);
// router.post('/signin', adminLoginLimiter, adminSignin);
router.get('/hi', admin)
router.post('/signup1', adminSignup1)
router.post('/signin1', adminSignin1)

export default router;