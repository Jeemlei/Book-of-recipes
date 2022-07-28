import { User } from '../types'
import bcrypt from 'bcrypt'
import UserSchema from '../models/user'
import logger from '../utils/logger'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../utils/config'
import { UserInputError, ValidationError } from 'apollo-server-express'
import { validateMongoId } from '../utils/tools'

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

	return user.save()
}

const allUsers = async (): Promise<User[]> => {
	return UserSchema.find({})
}

const findUser = async (id: string, username: string) => {
	if (id && !username) {
		return await UserSchema.findById(validateMongoId(id))
	} else if (username && !id) {
		return (await UserSchema.find({ username: username }))[0]
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

export default {
	createUser,
	allUsers,
	findUser,
	login
}
