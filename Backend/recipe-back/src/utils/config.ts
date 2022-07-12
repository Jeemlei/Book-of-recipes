import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT
export const FRONTEND_PORT = process.env.FRONTEND_PORT
export const NODE_ENV = process.env.NODE_ENV
export const MONGODB_URI = process.env.MONGODB_URI

export default {
	PORT,
	FRONTEND_PORT,
	NODE_ENV,
	MONGODB_URI
}
