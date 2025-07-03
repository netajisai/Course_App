import express from 'express'
import {
    getCourse, getSpecificCourse, 
    createCourse, updateCourse, deleteCourse, 
    getCourses, purchaseCourse, userPurchases
} from '../controllers/courseController.js'
import { adminAuth, userAuth } from '../middleware/auth.js'

// Router connection
const router = express.Router()

// Published Courses
router.get('/published', getCourses)

// Admin Course Routes
router.get('/admin', adminAuth, getCourse)

router.get('/:courseId', adminAuth, getSpecificCourse)

router.post('/', adminAuth, createCourse)

router.put('/:courseId', adminAuth, updateCourse)

router.delete('/:courseId', adminAuth, deleteCourse)


// User Course Routes
router.get('/user/purchases', userAuth, userPurchases)

router.post('/user/:courseId/purchase', userAuth, purchaseCourse)


export default router;