import express from 'express'
import mongoose from 'mongoose'
import config from './utils/config'
import logger from './utils/logger'
import apolloServer from './graphql/apolloserver'
import path from 'path'

const app = express()

mongoose
	.connect(config.MONGODB_URI as string)
	.then((_result) => {
		logger.info('connected to MongoDB')

		apolloServer
			.start()
			.then((_result) => {
				apolloServer.applyMiddleware({ app, path: '/api/graphql' })
				logger.info('ApolloServer running in path /api/graphql')
			})
			.catch((error: Error) => {
				logger.error(`error starting ApolloServer: ${error.message}`)
			})
	})
	.catch((error: Error) => {
		logger.info(`error connecting to MongoDB: ${error.message}`)
	})

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

export default app
