import { NODE_ENV } from './config'

const info = (msg: string) => {
	//There should be no logging during test runs
	//so error logging is ignored from code coverage
	/* istanbul ignore next */
	if (NODE_ENV !== 'test') {
		console.log(msg)
	}
}

const error = (msg: string) => {
	//There should be no logging during test runs
	//so error logging is ignored from code coverage
	/* istanbul ignore next */
	if (NODE_ENV !== 'test') {
		console.error(msg)
	}
}

export default {
	info,
	error
}
