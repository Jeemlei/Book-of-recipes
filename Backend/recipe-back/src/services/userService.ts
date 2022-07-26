import { User } from '../types'
import bcrypt from 'bcrypt'
import UserSchema from '../models/user'
import logger from '../utils/logger'
import { UserInputError, ValidationError } from 'apollo-server-express'

const createUser = async (
	username: string,
	password: string,
	name?: string
): Promise<User> => {
	const saltRounds = 10
	const passwordHash = await bcrypt.hash(password, saltRounds)

	const user = new UserSchema(
		name
			? {
					username: username,
					name: name,
					psswrd_hash: passwordHash
			  }
			: {
					username: username,
					psswrd_hash: passwordHash
			  }
	)

	return (await user.save()).toObject()
}

const allUsers = async (): Promise<User[]> => {
	return (await UserSchema.find({})).map((u) => u.toObject())
}

const findUser = async (
	id: string,
	username: string
): Promise<User | undefined> => {
	if (id && !username) {
		if (id.length !== 24) {
			logger.error(
				`-User provided id with incorrect length\n--Expected 24; got ${id.length}\n--ID: ${id}`
			)
			throw new UserInputError(
				`id must be length 24 (length was ${id.length})`,
				{
					invalidArgs: id
				}
			)
		} else if (id.match(/[^0-9a-f]+/)) {
			logger.error(`-User provided id with nonhexadecimal symbols\n--ID: ${id}`)
			throw new UserInputError('id must only include hexadecimal symbols', {
				invalidArgs: id
			})
		}

		return (await UserSchema.findById(id))?.toObject()
	} else if (username && !id) {
		return (await UserSchema.find({ username: username })).map((u) =>
			u.toObject()
		)[0]
	} else {
		logger.error(
			`-User did provide incorrect number of search arguments\n--Expected 1; got ${
				Number(!!id) + Number(!!username)
			}`
		)
		throw new ValidationError(
			'findUser: one and oly one of the optional search arguments must be provided'
		)
	}
}

export default {
	createUser,
	allUsers,
	findUser
}
