/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import supertest from 'supertest'
import app from '../src/app'
import mongooose from 'mongoose'
import config from '../src/utils/config'

const api = supertest(app)

afterAll(async () => {
	await mongooose.connection.close()
})

describe('Routes', () => {
	test('redirect root path to frontend', async () => {
		const res = await api.get('/')
		expect(res.status).toBe(302)
		expect(res.header.location).toBe(`http://localhost:${config.FRONTEND_PORT}`)
	})
})
