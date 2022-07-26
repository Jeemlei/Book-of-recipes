import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT
export const FRONTEND_PORT = process.env.FRONTEND_PORT
export const NODE_ENV = process.env.NODE_ENV
export const JWT_SECRET = process.env.JWT_SECRET
export const MONGODB_URI = (() => {
	switch (NODE_ENV) {
		case 'test':
			return process.env.TEST_DB
		case 'development':
			return process.env.DEV_DB
		default:
			return process.env.MONGODB_URI
	}
})()

export default {
	PORT,
	FRONTEND_PORT,
	NODE_ENV,
	JWT_SECRET,
	MONGODB_URI
}
