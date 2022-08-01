export interface User {
	id: string
	username: string
	name?: string
	recipe_ids: string[] | Recipe[]
}

export interface MongoUser extends Omit<User, 'id'> {
	psswrd_hash: string
	//MongoDB properties
	_id: string
	__v: number
}

export interface Context {
	currentUser: User
}

export interface JwtPayload {
	id: string
}

//Key as language identifier, e.g. "en" for english
export type NameTranslations = Map<string, string>

export interface UmbrellaTitle {
	id: string
	name: NameTranslations
}

export interface MongoUmbrellaTitle extends Omit<UmbrellaTitle, 'id'> {
	//MongoDB properties
	_id: string
	__v: number
}

export interface Ingredient {
	id: string
	name: NameTranslations
	recipe_id?: string | Recipe
}

export interface MongoIngredient extends Omit<Ingredient, 'id'> {
	//MongoDB properties
	_id: string
	__v: number
}

export interface Category {
	id: string
	name: NameTranslations
}

export interface MongoCategory extends Omit<Category, 'id'> {
	//MongoDB properties
	_id: string
	__v: number
}

export interface Recipe {
	id: string
	owner_id: string | User
	name: NameTranslations
	umbrella_id: string | UmbrellaTitle
	cookingtime: number
	servings: number
	ingredients: Array<{
		ingredient_id: string | Ingredient
		amout: number
		unit: string
	}>
	//Key as language identifier, e.g. "en" for english
	steps: Map<string, string[]>
	category_ids: string[] | Category[]
}

export interface MongoRecipe extends Omit<Recipe, 'id'> {
	//MongoDB properties
	_id: string
	__v: number
}
