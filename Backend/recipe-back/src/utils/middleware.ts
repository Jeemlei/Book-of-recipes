import { NextFunction, Request, Response } from 'express'
import logger from './logger'

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
