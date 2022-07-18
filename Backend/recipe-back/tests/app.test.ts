import supertest from 'supertest'
import app from '../src/app'
import mongoose from 'mongoose'
import config from '../src/utils/config'

const api = supertest(app)

afterAll(async () => {
	await mongoose.connection.close()
})

describe('Routes', () => {
	test('redirect root path to frontend', async () => {
		const res = await api.get('/')
		expect(res.status).toBe(302)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(res.header.location).toBe(`http://localhost:${config.FRONTEND_PORT}`)
	})
})
