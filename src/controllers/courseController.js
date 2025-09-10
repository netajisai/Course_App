import mongoose from 'mongoose'
import { CourseModel, PurchaseModel } from '../models/db.js'
import { course_schema, partial_course_schema } from '../schemas/schema.js'


export async function createCourse(req, res, next){ 
    const parsed = course_schema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid Course data",
            error: parsed.error
        })
    }
    
    const {title, description, price, imageLink}=req.body
    const adminId = req.tokenId

    try{
        const exists = await CourseModel.findOne({
            title,
            createdBy: adminId
        })
        if(exists){
            return res.status(409).json({
                message: `Admin has created course ${title} already`
            })
        }
        const adminCreate = await CourseModel.create({
            title,
            description,
            price,
            imageLink,
            createdBy: adminId
        })
        console.log(adminCreate)
        res.status(201).json({
            message: `Admin created Course ${title} successfully`
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message:`Error Creating Course:${err}`
        })
    }

}

export async function updateCourse(req, res, next){
    console.log(req.body)
    const parsed = partial_course_schema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid Course data",
            error: parsed.error
        })
    }
    
    const {title, description, price, imageLink} = req.body
    const courseId = req.params.courseId
    console.log(typeof(courseId))
    if(!mongoose.Types.ObjectId.isValid(courseId)){
        return res.status(400).json({
            message: "Invalid Course ID format"
        })
    }
    const adminId = req.tokenId
    console.log(adminId)
    try{
        const updateCourse = await CourseModel.updateOne({
            _id: courseId,
            createdBy: adminId
        }, {
            title,
            description,
            price,
            imageLink
        })
        console.log(updateCourse)
        if(updateCourse.matchedCount === 0){
            return res.status(404).json({
                message: `Course ${title} not found to update`
            })
        }
        res.json({
            message: `Course ${title} Updated Successfully`,
            courseId: updateCourse._id
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message:`Error Updating Course:${err}`
        })
    }
}


export async function deleteCourse(req, res, next){
    const adminId = req.tokenId
    const courseId = req.params.courseId
    console.log(typeof(courseId))
    if(!mongoose.Types.ObjectId.isValid(courseId)){
        return res.status(400).json({
            message: "Invalid Course ID format"
        })
    }
    try{
        const result = await CourseModel.deleteOne({
            _id: courseId,
            createdBy: adminId
        })
        console.log(result)
        if(result.deletedCount === 0){
            return res.status(404).json({
                message: `course not found to delete`
            })
        }
        res.json({
            message: `Course ${courseId} deleted successfully`
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `Error deleting course: ${err}`
        })
    }
}


export async function getCourse(req, res, next){
    const adminId = req.tokenId
    try{
        const courses = await CourseModel.find({createdBy: adminId}).lean()
        console.log(courses)
        if(courses.length === 0){
            return res.status(404).json({
                message:`Admin ${adminId} hasn't created any course`
            })
        }
        res.json({
            courses
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `Error on fetching course:${err}`
        })
    }
}


export async function getSpecificCourse(req, res, next){
    const adminId = req.tokenId
    const courseId = req.params.courseId
    if(!mongoose.Types.ObjectId.isValid(courseId)){
        return res.status(400).json({
            message:"Invalid courseId format"
        })
    }

    try{
        const course = await CourseModel.findOne({
            _id: courseId,
            createdBy: adminId
        }).lean()
        if(!course){
            return res.status(404).json({
                message: `Course ${courseId} not found or not owned by you`
            })
        }
        res.json({
            course
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `Error fetching course:${err}`
        })
    }
}


export async function getCourses(req, res, next){
    try{
        // CourseModel.find().sort({ createdAt: -1 }).limit(10)
        const courses = await CourseModel.find({}).lean()
        if(courses.length === 0){
            return res.status(404).json({
                message:`No courses found`
            })
        }
        res.json({
            courses
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `Error fetching courses:${err}`
        })
    }
}


export async function purchaseCourse(req, res, next){
    const userId = req.tokenId
    console.log(userId)
    const courseId = req.params.courseId
    if(!mongoose.Types.ObjectId.isValid(courseId)){
        return res.status(400).json({
            message: `Invalid courseId ${courseId} format`
        })
    }

    try{
        // if you are just reading documents from mongo use lean() method
        const course = await CourseModel.findOne({_id: courseId}).lean()
        console.log(course)
        if(!course){
            return res.status(404).json({
                message: `Course ${courseId} not found to purchase`
            })
        }
        // checking is user already bought the course
        const exists = await PurchaseModel.findOne({userId, courseId}).lean()
        if(exists){
            return res.status(409).json({
                message:`User ${userId} has already bought this course ${courseId}`
            })
        }
        const result = await PurchaseModel.create({
            userId, courseId
        })
        console.log(result)
        
        res.status(201).json({
            message: `Course ${courseId} purchased successfully`,
            result,
            courseInfo:course
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `Error purchasing course:${err}`
        })
    }
}


export async function userPurchases(req, res, next){
    const userId = req.tokenId
    try{
        const result = await PurchaseModel.find({userId}).lean()
        if(result.length === 0){
            return res.status(404).json({
                message: `User ${userId} not purchased any courses`
            })
        }

        // Mapping result documents to find course details bought by user
        const courseData = await CourseModel.find({
            _id: {$in: result.map(x => x.courseId)}
        }).lean()

        // find() inside map() will take O(n*m)
        // using a Map for O(1) lookup
        let purchaseMap = new Map()
        result.forEach(p => {
            purchaseMap.set(p.courseId.toString(), p.purchasedAt)
        })

        const response = courseData.map(course =>({
            course,
            purchasedAt: purchaseMap.get(course._id.toString()) || null
        }))
        res.json({
            courses: response
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `Error on fetching user purchased courses:${err}`
        })
    }
}