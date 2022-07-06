import express from 'express'
import path from 'path'
import { NODE_ENV, FRONTEND_PORT } from './config'

const app = express()

app.use(express.json())

if (NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, 'static')))
}

app.get('*', (_req, res) => {
	switch (NODE_ENV) {
		case 'production':
			res.sendFile(path.join(__dirname, 'static/index.html'))
			break
		default:
			res.redirect(`http://localhost:${FRONTEND_PORT}`)
	}
})

export default app
