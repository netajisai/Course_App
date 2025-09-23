import { ApolloServer } from "apollo-server-express"
import { gql } from "apollo-server-express"
import {
    adminTypeDefs, courseTypeDefs, userTypeDefs, purchaseTypeDefs, mutationDefs
} from "./schema.js"
import { resolvers } from "./resolvers.js"

const baseTypeDefs = gql`
  type Query {
    hello: String
  }
  type Mutation {
    _empty: String
  }
`
export const typeDefs = [
    baseTypeDefs,
    adminTypeDefs,
    courseTypeDefs,
    userTypeDefs,
    purchaseTypeDefs,
    mutationDefs
]

async function setupGraphQL(app){
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    })

    await server.start()
    server.applyMiddleware({ app, path: "/graphql"})

    console.log(`✅ GraphQL ready at http://localhost:3000/graphql`);
}

export default setupGraphQL
