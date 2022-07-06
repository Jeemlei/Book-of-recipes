/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import supertest from 'supertest'
import app from '../src/app'

const api = supertest(app)

test('example test', async () => {
	await api.get('/').expect(302)
	expect.anything()
})
