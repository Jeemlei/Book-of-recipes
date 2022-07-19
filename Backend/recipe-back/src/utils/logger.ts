import { NODE_ENV } from './config'

const info = (msg: string) => {
	if (NODE_ENV !== 'test') {
		//There should be no logging during test runs
		//so error logging is ignored from code coverage
		/* istanbul ignore next */
		console.log(msg)
	}
}

const error = (msg: string) => {
	if (NODE_ENV !== 'test') {
		//There should be no logging during test runs
		//so error logging is ignored from code coverage
		/* istanbul ignore next */
		console.error(msg)
	}
}

export default {
	info,
	error
}
