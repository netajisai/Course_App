import {z} from 'zod'

// Admin&User Signup Schema
export const signup_schema = z.object({
    username: z
      .string()
      .email("Username must be a valid email"), // ✅ email for login
    password: z
      .string()
      .min(4, "password must be atleast 4 chars")
      .max(10, "Password cannot exceed 100 characters"),
    name: z
      .string()
      .min(3, "name must be atleast 3 chars")
      .max(50, "Name cannot exceed 50 characters")
})

// Admin&User Signin Scheam
export const signin_schema = z.object({
    username: z
      .string()
      .email("Username must be a valid email"), // ✅ email for login
    password: z
      .string()
      .min(4, "password must be atleast 4 chars")
      .max(10, "Password cannot exceed 10 characters"),
})

// Schema for creating a course
export const course_schema = z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    price: z
      .number()
      .positive("Price must be a positive number"),
    imageLink: z.string()
})

// partial course_schema for updating course details
export const partial_course_schema = course_schema.partial()