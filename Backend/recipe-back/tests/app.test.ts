/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import supertest from 'supertest'
import app from '../src/app'

const api = supertest(app)

test('server is running', async () => {
	const response = await api.get('/').expect(200)
	expect(response).toBeDefined()
})
