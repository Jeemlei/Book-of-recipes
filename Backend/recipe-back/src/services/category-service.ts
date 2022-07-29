import CategorySchema from '../models/category'
import logger from '../utils/logger'

const enCategories = [
	'breakfast',
	'lunch',
	'snack',
	'dinner',
	'desser',
	'evening snack',
	'sidedish',
	'other'
]

const initCategories = async (): Promise<void> => {
	logger.info('Initializing categories...')
	await Promise.all(
		enCategories.map(async (c) => {
			const name = new Map([['en', c]])
			await new CategorySchema({ name: name }).save()
		})
	)
	logger.info('Categories initialized!')
}

export default {
	initCategories
}
