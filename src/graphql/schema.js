import { gql } from "apollo-server-express"


export const adminTypeDefs = gql`
  type Admin {
    id: ID!
    username: String!
    name: String!
    createdAt: String!
    updatedAt: String!
    courses: [Course!]! # One Admin → Many Courses
  }
  extend type Query {
    admins: [Admin!]!
    admin(id: ID!): Admin
  }
`

export const courseTypeDefs = gql`
  type Course {
    id: ID!
    title: String!
    description: String!
    price: Float!
    imageLink: String!
    createdAt: String!
    updatedAt: String!
    createdBy: Admin! # Many Courses -> One Admin
    purchases : [Purchase!]! # One Course -> Many Purchases
  }
  extend type Query {
    courses: [Course!]!
    course(id: ID!): Course
  }
`

export const userTypeDefs = gql`
  type User {
    id: ID!
    username: String!
    name: String!
    purchases: [Purchase!]! # One User -> Many Purchases
  }
  extend type Query {
    users: [User!]!
    user(id: ID!): User
  }
`

export const purchaseTypeDefs = gql`
  type Purchase {
    id: ID!
    purchasedAt: String!
    user: User! # Each Purchase belongs to one User
    course: Course! # Each Purchase belongs to one Course
  }
  extend type Query {
    purchases: [Purchase!]!
    purchase(id: ID!): Purchase
  }
`
export const mutationDefs = gql`
  input UpdateCourseInput {
    title: String
    description: String
    price: Float
    imageLink: String
  }

  extend type Mutation {
    createCourse(
      title: String!,
      description: String!,
      price: Float!,
      imageLink: String!,
      adminId: ID!
    ): Course!

    updateCourse(
      courseId: ID!
      input: UpdateCourseInput!
      adminId: ID!
    ): Course!

    deleteCourse(
      courseId: ID!
      adminId: ID!
    ): Course!
  }
`



// The ! means the field is non-nullable --> GraphQL enforces it before hitting your resolver
// so if we leave any field, that is defined in schema the query itself is rejected with a GraphQL validation error



// Auth handling
// REST --> req.tokenId set by middleware(JWT)
// GraphQL --> taking adminId as an argument
// less secure(a user could fake any adminId)
// extract adminId from GraphQL context(where JWT is decoded)


