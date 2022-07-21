import { ApolloServer } from 'apollo-server-express'
import typeDefs from './schema'
import resolvers from './resolvers'
import UserSchema from '../models/user'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../utils/config'

interface JwtPayload {
	id: string
}

const apolloServer = new ApolloServer({
	typeDefs,
	resolvers,
	context: async ({ req }) => {
		const auth = req ? req.headers.authorization : null
		if (auth && auth.toLowerCase().startsWith('bearer ')) {
			const decodedToken = jwt.verify(
				auth.substring(7),
				JWT_SECRET as string
			) as JwtPayload
			const currentUser = await UserSchema.findById(decodedToken.id)
			return { currentUser }
		}
		return null
	}
})

export default apolloServer
