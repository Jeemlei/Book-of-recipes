import userService from '../services/userService'

const resolvers = {
	Query: {
		allUsers: async () => await userService.allUsers(),
		findUser: async (_root: unknown, args: { id: string; username: string }) =>
			await userService.findUser(args.id, args.username)
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
