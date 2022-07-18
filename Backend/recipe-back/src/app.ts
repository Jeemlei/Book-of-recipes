import express from 'express'
import mongoose from 'mongoose'
import config from './utils/config'
import logger from './utils/logger'
import apolloServer from './graphql/apolloserver'
import path from 'path'
import middleware from './utils/middleware'

const app = express()

//Define routes and setup middlewares
const setupRoutes = () => {
	if (config.NODE_ENV === 'production') {
		app.use(express.static(path.join(__dirname, 'static')))
	}

	app.get('*', (_req, res) => {
		switch (config.NODE_ENV) {
			case 'production':
				res.sendFile(path.join(__dirname, '../static/index.html'))
				break
			default:
				res.redirect(`http://localhost:${config.FRONTEND_PORT}`)
		}
	})

	app.use(middleware.errorHandler)

	logger.info('routes running')
}

//Connect to database
mongoose
	.connect(config.MONGODB_URI as string)
	.then((_result) => {
		logger.info('connected to MongoDB')
	})
	.catch((error: Error) => {
		logger.info(`error connecting to MongoDB: ${error.message}`)
	})

//Start GraphQL api
apolloServer
	.start()
	.then((_result) => {
		apolloServer.applyMiddleware({ app, path: '/api/graphql' })
		logger.info('ApolloServer running in path /api/graphql')
		setupRoutes()
	})
	.catch((error: Error) => {
		logger.error(`error starting ApolloServer: ${error.message}`)
	})

export default app
