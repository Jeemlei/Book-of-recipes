import { gql } from 'apollo-server-express'

export const typeDefs = gql`
	type User {
		id: String!
		username: String!
		name: String
		recipe_ids: [String]
	}

	type Query {
		allUsers: [User]!
		findUser(id: String, username: String): User
	}

	type Mutation {
		createUser(username: String!, name: String, password: String!): User
	}
` //When recipe is defined replace String in User recipe_ids

export default typeDefs
