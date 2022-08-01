import mongoose from 'mongoose'
import { Ingredient, MongoIngredient } from '../types'
import uniqueValidator from 'mongoose-unique-validator'

const schema = new mongoose.Schema<Ingredient>(
	{
		name: {
			type: Map,
			of: String,
			required: true,
			unique: true,
			immutable: true
		},
		recipe_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Recipe'
		}
	},
	{
		toObject: {
			transform: (_document, returnedObject: MongoIngredient): Ingredient => {
				return {
					id: returnedObject._id.toString(),
					name: returnedObject.name,
					recipe_id: returnedObject.recipe_id
				}
			}
		}
	}
)

schema.plugin(uniqueValidator)

export default mongoose.model('Ingredient', schema)
