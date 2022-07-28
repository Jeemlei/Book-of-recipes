import { UserInputError } from 'apollo-server-express'
import logger from './logger'
import fs from 'fs'

const isString = (text: unknown): text is string => {
	return typeof text === 'string' || text instanceof String
}

export const validateMongoId = (id: unknown): string => {
	if (!id || !isString(id)) {
		logger.error(
			`-id provided for validateMongoId() was not of type string\n--ID: ${id}`
		)
		throw new TypeError('id must be of type string')
	}
	if (id.length !== 24) {
		logger.error(
			`-User provided id with incorrect length\n--Expected 24; got ${id.length}\n--ID: ${id}`
		)
		throw new UserInputError(`id must be length 24 (length was ${id.length})`, {
			invalidArgs: id
		})
	} else if (id.match(/[^0-9a-f]+/)) {
		logger.error(`-User provided id with nonhexadecimal symbols\n--ID: ${id}`)
		throw new UserInputError('id must only include hexadecimal symbols', {
			invalidArgs: id
		})
	}
	return id
}

/**
 * Tool for initializing MongoDB from JSON file or Object.
 * If both params are provided only the file will be used.
 * @param {string} file - filepath of the .json file
 * @param {object} object - JSON Object
 */
export const initDB = (
	file?: string | undefined,
	object?: object | undefined
) => {
	if (file) {
		const rawdata = String(fs.readFileSync(file))
		object = JSON.parse(rawdata) as object
	} else if (!object) {
		logger.info('No init data for db were provided')
		return
	}
	console.log(object)
}
