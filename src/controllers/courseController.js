import mongoose from 'mongoose'
import { CourseModel, PurchaseModel } from '../models/db.js'
import { course_schema, partial_course_schema } from '../schemas/schema.js'
import { safeParse } from 'zod/v4-mini'



export async function getAdminCourses(req, res, next){
    const adminId = req.tokenId
    try{
        // const courses = await CourseModel.find({ createdBy: adminId })
        // .populate("createdBy", "username name -_id") // ✅ include only username & name
        // .lean()
        // {
        //     "courses": [
        //         {
        //         "_id": "64fabcd1234def56789abc01",
        //         "title": "Node.js Mastery",
        //         "description": "Learn backend development",
        //         "price": 199,
        //         "imageLink": "https://example.com/course.png",
        //         "createdBy": {
        //             "username": "admin@example.com",
        //             "name": "John Admin"
        //         },
        //         "createdAt": "2025-09-10T10:20:30.000Z",
        //         "updatedAt": "2025-09-10T10:20:30.000Z"
        //         }
        //     ]
        // }
        const courses = await CourseModel.find({ createdBy: adminId }).lean()
        if (courses.length==0){
            return res.status(404).json({
                message: `Admin ${adminId} hasn't created any course`
            })
        }
        res.status(200).json({
            courses
        })
    }catch(err){
        console.log(`Error on fetching courses for admin: ${adminId}`)
        return res.status(500).json({
            message: `Error on fetching courses for admin: ${adminId}`
        })
    }
}

export async function getSpecificCourse(req, res, next){
    const adminId = req.tokenId
    const courseId = req.params.courseId
    // validate ObjectId
    if(!mongoose.Types.ObjectId.isValid(courseId)){
        return res.status(400).json({
            message: "Invalid course ID format"
        })
    }
    try{
        // const course = await CourseModel.findOne({ _id: courseId, createdBy: adminId })
        // .populate("createdBy", "username name -_id")
        // .lean()
        const course = await CourseModel.findOne({_id:courseId, createdBy:adminId}).lean()
        if(!course){
            return res.status(404).json({
                message: `Course ${courseId} not found or not owned by you`
            })
        }
        res.status(200).json({
            message: "Course fetched successfully",
            course
        })
    }catch(err){
        console.error(`Error fetching course for courseID: ${courseId}`, err)
        res.status(500).json({
            message: `Error fetching course for courseID: ${courseId}`, err
        })
    }
}

export async function createCourse(req, res, next){
    // validate request payload with zod
    console.log(req.body)
    const parsedData = course_schema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({
            message: "Incorrect payload",
            error: parsedData.error
        })
    }
    const { title, description, price, imageLink } = parsedData.data
    const adminId = req.tokenId
    try{
        // check if course already exists
        const exists = await CourseModel.findOne({
            title,
            createdBy: adminId
        })
        if(exists){
            return res.status(409).json({
                message: `Admin has already created course ${title}`
            })
        }
        // later add a compound index { title: 1, createdBy: 1, unique: true } at the DB level 
        // for stronger enforcement.
        const course = await CourseModel.create({
            title, description, price, imageLink, createdBy: req.tokenId
        })
        res.status(201).json({
            message:`Course Created: ${title}`,
            course_id: course._id
        })
    }catch(err){
        console.log(`Error during creating course:${err}`)
        res.status(500).json({
            message: `Error during creating course:${err}`
        })
    }
}


export async function updateCourse(req, res, next){
    const parsedData = partial_course_schema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({
            message: "Invalid course payload",
            error: parsedData.error
        })
    }
    const adminId = req.tokenId
    const courseId = req.params.courseId
    const { title, description, price, imageLink } = parsedData.data
    if(!mongoose.Types.ObjectId.isValid(courseId)){
        return res.status(400).json({
            message: "Invalid courseId format"
        })
    }
    try{
        // create a new payload with only provided values 
        const updatePayload = {}
        if (title!==undefined) updatePayload.title=title
        if (description !== undefined) updatePayload.description = description
        if (price !== undefined) updatePayload.price = price
        if (imageLink !== undefined) updatePayload.imageLink = imageLink
        // checks if course exists or not and then update if found
        const updateCourse = await CourseModel.findOneAndUpdate(
            { _id: courseId, createdBy: adminId },
            { $set: updatePayload },
            { new: true }
        ).lean()
        console.log(updateCourse)
        if(!updateCourse){
            return res.status(404).json({
                message: `Course ${courseId} not found or not owned by you.`
            })
        }
        res.json({
            message: `Course ${courseId} Updated Successfully`,
            course: updateCourse
        })
    }catch(err){
        console.error(`Error modifying course for courseID: ${courseId}`, err)
        res.status(500).json({
            message: `Error modifying course for courseID: ${courseId}`, err
        })
    }
}


export async function deleteCourse(req, res, next){
    const adminId = req.tokenId
    const courseId = req.params.courseId
    if(!mongoose.Types.ObjectId.isValid(courseId)){
        return res.status(400).json({
            message: "Invalid courseId format"
        })
    }
    try{
        const deleteCourse = await CourseModel.findOneAndDelete({
            _id: courseId,
            createdBy: adminId
        })
        console.log(deleteCourse)
        if(!deleteCourse){
            return res.status(404).json({
                message: `Course ${courseId} not found or not owned by you`
            })
        }
        return res.status(200).json({
            message: `Course ${courseId} deleted successfully`
        })
    }catch(err){
        console.log(`Error deleting course ${courseId}`)
        res.json({
            message: `Error deleting course ${courseId}`
        })
    }
}



export async function getCourses(req, res, next){
    try{
        // const courses = await CourseModel.find({}).lean()
        const courses = await CourseModel.find({}).sort({ createdAt:-1 }).limit(10).lean()
        if(courses.length==0){
            return res.status(404).json({
                message: "No Courses found"
            })
        }
        res.status(200).json({
            courses
        })

    }catch(err){
        console.log(`Error Fetching courses: ${err}`)
        res.status(500).json({
            message: `Error fetching courses: ${err}`
        })
    }
}


export async function userPurchases(req, res, next){
    const userId = req.tokenId
    try{
        const userCourses = await PurchaseModel.find({ userId }).lean()
        if(userCourses.length==0){
            return res.json({
                message: `User ${userId} hasn't purchased any courses`
            })
        }
        // Mapping userCourses documents to find course information bought by user
        const courseData = await CourseModel.find({
            _id: {$in: userCourses.map(x => x.courseId)}
        }).lean()
        // find() inside map() will take O(n*m)
        // using a Map for O(1) lookup
        let purchaseMap = new Map()
        userCourses.forEach(p=>{
            purchaseMap.set(p.courseId.toString(), p.purchasedAt)
        })
        console.log(purchaseMap)
        const response = courseData.map(course => ({
            course,
            purchasedAt: purchaseMap.get(course._id.toString()) || null
        }))
        res.status(200).json({
            message: `User ${userId} has purchased ${userCourses.length} courses`,
            response
        })
    }catch(err){
        console.log(`Error fetching purchased courses for user:${user}`)
        res.status(500).json({
            message: `Error fetching purchased courses for user: ${user}`
        })
    }
}


export async function purchaseCourse(req, res, next){
    const userId = req.tokenId
    const courseId = req.params.courseId
    if(!mongoose.Types.ObjectId.isValid(courseId)){
        return res.status(400).json({
            message: `Invalid courseId ${courseId}`
        })
    }

    try{
        const course = await CourseModel.findOne({_id:courseId}).lean()
        console.log(course)
        if(!course){
            return res.status(500).json({
                message: `Course ${courseId} doesn't exist to purchase`
            })
        }
        const exists = await PurchaseModel.findOne({userId, courseId}).lean()
        if(exists){
            return res.status(409).json({
                message: `User ${userId} has already bought this course ${courseId}`
            })
        }
        const purchaseCourse = await PurchaseModel.create({
            userId, courseId
        })

        res.send({
            message: `User ${userId} purchased course ${courseId} successfully`,
            purchaseCourse
        })

    }catch(err){
        console.log(`Error Purchasing course for user ${userId}: ${err}`)
        res.status(500).json({
            message: `Error Purchasing course for user ${userId}: ${err}`
        })
    }
}