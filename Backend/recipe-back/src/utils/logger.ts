import { NODE_ENV } from './config'

const info = (msg: string) => {
	if (NODE_ENV !== 'test') {
		console.log(msg)
	}
}

const error = (msg: string) => {
	if (NODE_ENV !== 'test') {
		console.error(msg)
	}
}

export default {
	info,
	error
}
