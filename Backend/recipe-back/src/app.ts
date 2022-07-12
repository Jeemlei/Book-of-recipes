import express from 'express'
import path from 'path'
import config from './utils/config'
import apolloServer from './graphql/apolloserver'
import mongoose from 'mongoose'

const app = express()

mongoose
	.connect(config.MONGODB_URI as string)
	.then((_result) => {
		console.log('connected to MongoDB')

		apolloServer
			.start()
			.then((_result) => {
				apolloServer.applyMiddleware({ app, path: '/api/graphql' })
				console.log('ApolloServer running in path /api/graphql')
			})
			.catch((error: Error) => {
				console.log('error connecting to MongoDB:', error.message)
			})
	})
	.catch((error: Error) => {
		console.log('error connecting to MongoDB:', error.message)
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
