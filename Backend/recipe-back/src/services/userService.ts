import { User } from '../types'
import UserSchema from '../models/user'
import bcrypt from 'bcrypt'

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

const findUserById = async (id: string) => {
	return UserSchema.findById(id)
}

const findUserByUsername = async (username: string) => {
	return (await UserSchema.find({ username: username }))[0]
}

export default {
	createUser,
	allUsers,
	findUserById,
	findUserByUsername
}
