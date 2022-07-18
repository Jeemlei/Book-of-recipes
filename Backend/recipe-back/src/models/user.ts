import mongoose from 'mongoose'
import { User } from '../types'
import uniqueValidator from 'mongoose-unique-validator'

const schema = new mongoose.Schema<User>(
	{
		username: { type: String, required: true, unique: true },
		name: { type: String },
		psswrd_hash: { type: String, required: true },
		recipe_ids: { type: [Number] } //Define populate when recipe schema is ready
	},
	{
		toJSON: {
			transform: (_document, returnedObject: User) => {
				returnedObject.id = returnedObject._id?.toString()
				delete returnedObject._id
				delete returnedObject.__v
			}
		}
	}
)

schema.plugin(uniqueValidator)

export default mongoose.model('User', schema)
