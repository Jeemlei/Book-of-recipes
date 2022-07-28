import mongoose from 'mongoose'
import { User, MongoUser } from '../types'
import uniqueValidator from 'mongoose-unique-validator'

const schema = new mongoose.Schema<MongoUser>(
	{
		username: { type: String, required: true, unique: true },
		name: { type: String },
		psswrd_hash: { type: String, required: true },
		recipe_ids: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Recipe',
				required: true
			}
		]
	},
	{
		toObject: {
			transform: (_document, returnedObject: MongoUser): User => {
				return {
					id: returnedObject._id.toString(),
					username: returnedObject.username,
					name: returnedObject.name,
					recipe_ids: returnedObject.recipe_ids
				}
			}
		}
	}
)

schema.plugin(uniqueValidator)

export default mongoose.model('User', schema)