import IngredientSchema from '../models/ingredient'
import { Ingredient, NameTranslations } from '../types'

const createIngredient = async (
	name: NameTranslations
): Promise<Ingredient> => {
	const newIngredient = new IngredientSchema({ name: name })
	return (await newIngredient.save()).toObject()
}

export default {
	createIngredient
}
