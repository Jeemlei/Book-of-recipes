import { UserInputError, ValidationError } from 'apollo-server-express'
import userService from '../services/userService'

const resolvers = {
	Query: {
		allUsers: async () => await userService.allUsers(),
		findUser: async (
			_root: unknown,
			args: { id: string; username: string }
		) => {
			if (args.id) {
				if (args.id.length !== 24) {
					throw new UserInputError('id must be length 24', {
						invalidArgs: args.id
					})
				}
				return await userService.findUserById(args.id)
			} else if (args.username) {
				return await userService.findUserByUsername(args.username)
			} else {
				throw new ValidationError(
					'findUser: one of the optional search arguments must be provided'
				)
			}
		}
	},

	Mutation: {
		createUser: async (
			_root: unknown,
			args: {
				username: string
				password: string
				name?: string
			}
		) => {
			return await userService.createUser(
				args.username,
				args.password,
				args.name
			)
		}
	}
}

export default resolvers
