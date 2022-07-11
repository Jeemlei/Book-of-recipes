import express from 'express'
import path from 'path'
import { NODE_ENV, FRONTEND_PORT } from './utils/config'
import apolloServer from './graphql/apolloserver'

const app = express()

const startApolloServer = async () => {
	await apolloServer.start()

	apolloServer.applyMiddleware({ app, path: '/api/graphql' })

	if (NODE_ENV === 'production') {
		app.use(express.static(path.join(__dirname, 'static')))
	}

	app.get('*', (_req, res) => {
		switch (NODE_ENV) {
			case 'production':
				res.sendFile(path.join(__dirname, '../static/index.html'))
				break
			default:
				res.redirect(`http://localhost:${FRONTEND_PORT}`)
		}
	})
}

void startApolloServer()

export default app
