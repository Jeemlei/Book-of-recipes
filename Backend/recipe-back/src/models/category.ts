import mongoose from 'mongoose'
import { Category, MongoCategory } from '../types'
import uniqueValidator from 'mongoose-unique-validator'

const schema = new mongoose.Schema<Category>(
	{
		name: {
			type: Map,
			of: String,
			required: true,
			unique: true,
			immutable: true
		}
	},
	{
		toObject: {
			transform: (_document, returnedObject: MongoCategory): Category => {
				return {
					id: returnedObject._id.toString(),
					name: returnedObject.name
				}
			}
		}
	}
)

schema.plugin(uniqueValidator)

export default mongoose.model('Category', schema)
