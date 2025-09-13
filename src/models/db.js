import mongoose from 'mongoose'

const Schema = mongoose.Schema

const AdminSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    name: {type: String, required: true}
}, {timestamps:true})

const UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    name: {type: String, required: true}
}, {timestamps:true})

const CourseSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true, min: 0},
    imageLink: {type: String, required: true},
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'admins',
        required: true
    }
}, { timestamps: true})
// Add an index for sorting by createdAt
CourseSchema.index({ createdAt: -1 })


const PurchaseSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'courses',
        required: true
    },
    purchasedAt: {
        type: Date,
        default: Date.now
    }
})
// PurchaseSchema.index({ user: 1, course: 1 }, { unique: true })

const AdminModel = mongoose.model('admins', AdminSchema)
const UserModel = mongoose.model('users', UserSchema)
const CourseModel = mongoose.model('courses', CourseSchema)
const PurchaseModel = mongoose.model('purchases', PurchaseSchema)

export { AdminModel, UserModel, CourseModel, PurchaseModel}