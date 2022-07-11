import { gql } from 'apollo-server-express'

export const typeDefs = gql`
	type Query {
		example: String
	}
`
export default typeDefs
