import express from 'express'
import path from 'path'

const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, 'static')))

const PORT = 3000

app.get('*', (_req, res) => {
	res.sendFile(path.join(__dirname, 'static/index.html'))
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
