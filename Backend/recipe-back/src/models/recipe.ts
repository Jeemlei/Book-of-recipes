import mongoose from 'mongoose'
import { Recipe, MongoRecipe } from '../types'
import uniqueValidator from 'mongoose-unique-validator'

const schema = new mongoose.Schema<Recipe>(
	{
		owner_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		name: {
			type: Map,
			of: String,
			required: true,
			unique: true
		},
		umbrella_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'UmbrellaTitle',
			required: true
		},
		cookingtime: { type: Number, required: true },
		servings: { type: Number, required: true },
		ingredients: [
			{
				ingredient_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Ingredient',
					required: true
				},
				amount: { type: Number, required: true },
				unit: { type: String, required: true }
			}
		],
		steps: {
			type: Map,
			of: [String],
			required: true
		},
		category_ids: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Category',
				required: true
			}
		]
	},
	{
		toObject: {
			transform: (_document, returnedObject: MongoRecipe): Recipe => {
				return {
					id: returnedObject._id.toString(),
					owner_id: returnedObject.owner_id,
					name: returnedObject.name,
					umbrella_id: returnedObject.umbrella_id,
					cookingtime: returnedObject.cookingtime,
					servings: returnedObject.servings,
					ingredients: returnedObject.ingredients,
					steps: returnedObject.steps,
					category_ids: returnedObject.category_ids
				}
			}
		}
	}
)

schema.plugin(uniqueValidator)

export default mongoose.model('Recipe', schema)
