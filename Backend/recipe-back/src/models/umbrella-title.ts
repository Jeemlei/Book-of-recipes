import mongoose from 'mongoose'
import { UmbrellaTitle, MongoUmbrellaTitle } from '../types'
import uniqueValidator from 'mongoose-unique-validator'

const schema = new mongoose.Schema<UmbrellaTitle>(
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
			transform: (
				_document,
				returnedObject: MongoUmbrellaTitle
			): UmbrellaTitle => {
				return {
					id: returnedObject._id.toString(),
					name: returnedObject.name
				}
			}
		}
	}
)

schema.plugin(uniqueValidator)

export default mongoose.model('UmbrellaTitle', schema)
