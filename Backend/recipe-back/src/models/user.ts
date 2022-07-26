import mongoose from 'mongoose'
import { MongoUser, User } from '../types'
import uniqueValidator from 'mongoose-unique-validator'

const schema = new mongoose.Schema<User>(
	{
		username: { type: String, required: true, unique: true },
		name: { type: String },
		psswrd_hash: { type: String, required: true },
		recipe_ids: { type: [Number] } //Define populate when recipe schema is ready
	},
	{
		toObject: {
			transform: (_document, returnedObject: MongoUser): User => {
				return {
					id: returnedObject._id.toString(),
					username: returnedObject.username,
					name: returnedObject.name,
					psswrd_hash: returnedObject.psswrd_hash,
					recipe_ids: returnedObject.recipe_ids
				}
			}
		}
	}
)

schema.plugin(uniqueValidator)

export default mongoose.model('User', schema)
