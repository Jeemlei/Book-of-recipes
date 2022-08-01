import { NameTranslations, Recipe } from '../types'
import RecipeSchema from '../models/recipe'
import UserSchema from '../models/user'
import umbrellaTitleService from './umbrella-title-service'
import ingredientService from './ingredient-service'

const createRecipe = async (
	owner_id: string,
	name: NameTranslations,
	umbrella_id: string,
	cookingtime: number,
	servings: number,
	ingredients: Array<{
		ingredient_id: string
		amount: number
		unit: string
	}>,
	steps: Map<string, string[]>,
	category_ids: string[]
): Promise<Recipe> => {
	/* 	Checking if umbrella title is new
	   	EXAMPLE of new title in english:
	   		NEWenTortilla
	*/
	if (umbrella_id.match(/^NEW[a-z]{2}\D{1,32}$/)) {
		umbrella_id = (
			await umbrellaTitleService.createUmbrellaTitle(
				new Map([[umbrella_id.substring(3, 5), umbrella_id.substring(5)]])
			)
		).id
	}
	/* 	Checking if any of the ingredients is new
	   	EXAMPLE of new ingredient in english:
	   		NEWenBlack Pepper
	*/
	ingredients = await Promise.all(
		ingredients.map(async (i) => {
			if (i.ingredient_id.match(/^NEW[a-z]{2}\D{1,32}$/)) {
				i.ingredient_id = (
					await ingredientService.createIngredient(
						new Map([
							[i.ingredient_id.substring(3, 5), i.ingredient_id.substring(5)]
						])
					)
				).id
			}
			return { ingredient_id: i.ingredient_id, amount: i.amount, unit: i.unit }
		})
	)

	const newRecipe = (
		await new RecipeSchema({
			owner_id,
			name,
			umbrella_id,
			cookingtime,
			servings,
			ingredients,
			steps,
			category_ids
		}).save()
	).toObject()
	await UserSchema.findByIdAndUpdate(owner_id, {
		$push: { recipe_ids: newRecipe.id }
	})
	return newRecipe
}

export default {
	createRecipe
}
