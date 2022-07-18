import { NextFunction, Request, Response } from 'express'
import logger from './logger'

//There should be no logging during test runs
//so error logging is ignored from code coverage
/* istanbul ignore next */
const errorHandler = (
	error: Error,
	_req: Request,
	_res: Response,
	next: NextFunction
) => {
	logger.error(error.message)

	next(error)
}

export default {
	errorHandler
}
