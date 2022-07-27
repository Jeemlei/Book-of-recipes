export interface User {
	id: string
	username: string
	name?: string
	recipe_ids: number[] | Recipe[]
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

export interface UmbrellaTitle {
	id: string
	//Key as language identifier, e.g. "en" for english
	name: Map<string, string>
}

export interface MongoUmbrellaTitle extends Omit<UmbrellaTitle, 'id'> {
	//MongoDB properties
	_id: string
	__v: number
}

export interface Ingredient {
	id: string
	//Key as language identifier, e.g. "en" for english
	name: Map<string, string>
	recipe_id?: string | Recipe
}

export interface MongoIngredient extends Omit<Ingredient, 'id'> {
	//MongoDB properties
	_id: string
	__v: number
}

export interface Category {
	id: string
	//Key as language identifier, e.g. "en" for english
	name: Map<string, string>
}

export interface MongoCategory extends Omit<Category, 'id'> {
	//MongoDB properties
	_id: string
	__v: number
}

export interface Recipe {
	id: string
	owner_id: string | User
	//Key as language identifier, e.g. "en" for english
	name: Map<string, string>
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
