import mongoose, { deleteModel } from "mongoose"
import { 
  AdminModel, CourseModel, UserModel, PurchaseModel
} from "../models/db.js";
import { course_schema, partial_course_schema } from "../schemas/schema.js";

export const resolvers = {
  Query: {
    hello: () => "Hello from GraphQL 🚀",

    // Admin queries
    admins: async () => AdminModel.find(),
    admin: async (_, { id }) => AdminModel.findById(id),

    // Course queries
    courses: async () => CourseModel.find().populate("createdBy"),
    course: async (_, { id }) => CourseModel.findById(id).populate("createdBy"),
    
    // Usrer queries
    users: async () => UserModel.find(),
    user: async (_, { id }) => UserModel.findById(id),

    // Purchase queries
    purchases: async () => PurchaseModel.find(),
    purchase: async (_, { id }) => PurchaseModel.findById(id)

  },

  // Relationships(field resolvers)

  Admin: {
    // Admin -> Courses
    courses: async (parent) => {
      return CourseModel.find({ createdBy: parent._id });
    },
  },
  
  Course: {
    // Courses -> Admin
    createdBy: async (parent) => {
      return AdminModel.findById(parent.createdBy);
    },
    // Courses -> Purchases
    purchases: async (parent) => {
      return PurchaseModel.find({ courseId:parent._id })
    }
  },

  User: {
    // User -> Purchases
    purchases: async (parent) => {
      return PurchaseModel.find({ userId: parent._id})
    }
  },

  Purchase: {
    // Purchase -> User
    user: async (parent) => {
      return UserModel.findById(parent.userId)
    },
    // Purchase -> Course
    course: async (parent) => {
      return CourseModel.findById(parent.courseId)
    }
  },

  Mutation: {
    createCourse: async (_, args) => {
      // validate input
      const parsed = course_schema.safeParse(args)
      if(!parsed.success){
        throw new Error(parsed.error.errors.map(e=>e.message).join(", "))
      }
      const {title, description, price, imageLink, adminId} = parsed.data
      // Step-1: Check if adminId is valid ObjectId
      if(!mongoose.Types.ObjectId.isValid(adminId)){
        throw new Error("Invalid adminId format")
      }
      // Step-2: check if admin exists
      const admin = await AdminModel.findById(adminId)
      if(!admin){
        throw new Error("Admin not found")
      }
      // Step-3; check if course already exists
      const exists = await CourseModel.findOne({
        title, createdBy: adminId
      })
      if(exists){
        throw new Error(`Admin has created course ${title} already`)
      }
      // Step-4: create course
      const newCourse = await CourseModel.create({
        title,
        description,
        price,
        imageLink,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return newCourse
    },

    updateCourse: async (_, {courseId, input, adminId} ) => {
      // validate input
      const parsed = partial_course_schema.safeParse(input)
      console.log(parsed)
      if(!parsed.success){
        throw new Error(parsed.error.errors.map(e=>e.message).join(", "))
      }
      console.log(parsed.data)
      // step 1: validate courseId + adminId
      if(!mongoose.Types.ObjectId.isValid(courseId)){
        throw new Error("Invalid courseId format")
      }
      if(!mongoose.Types.ObjectId.isValid(adminId)){
        throw new Error("Invalid adminId format")
      }
      const updatedCourse = await CourseModel.findOneAndUpdate(
        { _id: courseId, createdBy: adminId },
        { $set: { ...parsed.data, updatedAt: new Date()}},
        { new: true }
      ).lean()
      console.log(updatedCourse)
      if(!updatedCourse){
        throw new error(`Course ${courseId} not found or not owned by you`)
      }
      return updatedCourse
    },

    deleteCourse: async(_, args) => {
      const { courseId, adminId } = args
      if(!mongoose.Types.ObjectId.isValid(courseId)){
        throw new Error("Invalid courseId format")
      }
      if(!mongoose.Types.ObjectId.isValid(adminId)){
        throw new Error("Invalid adminId format")
      }
      const deleteCourse = await CourseModel.findOneAndDelete(
        {_id: courseId, createdBy: adminId}
      ).populate("createdBy", "username").lean()
      console.log(deleteCourse)
      if(!deleteCourse){
        throw new Error("Course not found or unauthorized")
      }
      return deleteCourse
    }
  },
};


// Query resolvers = top-level entry points.
// handles direct entry queries like admins, courses, users, purchases
// Relationship resolvers(field resolvers)
// Admin.courses --> fetch all courses created by that Admin
// Course.createdBy --> resolve the admin of that course
// Course.purchases --> all purchases of that course
// User.purchases --> all purchases by that user
// Purchase.user --> fetch user info for the purchase
// Purchase.course --> fetch course info for the purchase
