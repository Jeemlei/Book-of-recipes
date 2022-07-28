import userService from '../services/userService'
import { Context } from '../types'
import { initDB } from '../utils/tools'

const resolvers = {
	Query: {
		allUsers: async () => await userService.allUsers(),
		findUser: async (_root: unknown, args: { id: string; username: string }) =>
			await userService.findUser(args.id, args.username),
		me: (_root: unknown, _args: unknown, context: Context) => {
			return context.currentUser
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
		},
		login: async (
			_root: unknown,
			args: {
				username: string
				password: string
			}
		) => {
			return await userService.login(args.username, args.password)
		},
		initDB: (_root: unknown, args: { file: string }) => {
			initDB(args.file)
			return 'initDB() called'
		}
	}
}

export default resolvers
