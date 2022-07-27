import { User } from '../types'
import bcrypt from 'bcrypt'
import UserSchema from '../models/user'
import logger from '../utils/logger'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../utils/config'
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
		const result = (await UserSchema.find({ username: username }))[0]
		return result ? result.toObject() : result
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

const login = async (
	username: string,
	password: string
): Promise<{ token: string }> => {
	if (!username || !password) {
		throw new ValidationError('missing username or password')
	}

	const user = await UserSchema.findOne({ username })
	const passwordCorrect =
		user === null ? false : await bcrypt.compare(password, user.psswrd_hash)

	if (!(user && passwordCorrect)) {
		throw new UserInputError('wrong username or password')
	}

	const userForToken = {
		username: user.username,
		id: user._id
	}

	return {
		token: jwt.sign(userForToken, JWT_SECRET as string, { expiresIn: '6h' })
	}
}

const deleteUser = async (id: string): Promise<User | undefined> => {
	if (id.length !== 24) {
		logger.error(
			`-User provided id with incorrect length\n--Expected 24; got ${id.length}\n--ID: ${id}`
		)
		throw new UserInputError(`id must be length 24 (length was ${id.length})`, {
			invalidArgs: id
		})
	} else if (id.match(/[^0-9a-f]+/)) {
		logger.error(`-User provided id with nonhexadecimal symbols\n--ID: ${id}`)
		throw new UserInputError('id must only include hexadecimal symbols', {
			invalidArgs: id
		})
	}

	return (await UserSchema.findByIdAndRemove(id))?.toObject()
}

export default {
	createUser,
	allUsers,
	findUser,
	login,
	deleteUser
}
