export interface User {
	id?: string
	username: string
	name?: string
	psswrd_hash: string
	recipe_ids?: number[]
	//MongoDB properties
	_id?: string
	__v?: number
}
