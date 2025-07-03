import {z} from 'zod'

// Schema for signing up for admin&user
export const signup_body = z.object({
    username: z.string().email(),
    password: z.string().min(4, "password must be atleast 4 chars").max(10),
    name: z.string().min(3, "name must be atleast 3 chars").max(10)
})

// Scheam for signing in for admin&user
export const signin_body = z.object({
    username: z.string().email(),
    password: z.string().min(4).max(10)
})

// Schema for creating a course
export const course_schema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be a positive number"),
    imageLink: z.string()
})

// partial course_schema for updating course details
export const partial_course_schema = course_schema.partial()