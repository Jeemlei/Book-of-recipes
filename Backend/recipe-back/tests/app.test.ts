import supertest from 'supertest'
import app from '../src/app'
import mongoose from 'mongoose'
import config from '../src/utils/config'
import UserSchema from '../src/models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../src/utils/config'

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

//Following tests test authentication process in post-requests,
//please write graphql tests to dedicated files, not here
describe('Authentication', () => {
	beforeAll(async () => {
		await UserSchema.remove({})
		const psswrd_hash = await bcrypt.hash('password', 10)
		await new UserSchema({
			username: 'testuser',
			name: 'Test User',
			psswrd_hash
		}).save()
	})

	test('query me returns null if authorization header missing', async () => {
		const queryData = {
			query: `query Query {
				me {
					username
				}
			}`
		}
		const res = await api.post('/api/graphql').send(queryData)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(res.body.data.me).toBeNull()
		expect(res.status).toBe(200)
	})

	test('query me returns user if authorization header has correct token', async () => {
		const user = await UserSchema.findOne({ username: 'testuser' })

		const userForToken = {
			username: user?.username,
			id: user?._id
		}

		const token = jwt.sign(userForToken, JWT_SECRET as string, {
			expiresIn: '6h'
		})

		const queryData = {
			query: `query Query {
				me {
					username
				}
			}`
		}

		const res = await api
			.post('/api/graphql')
			.set('Authorization', `bearer ${token}`)
			.send(queryData)

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(res.body.data.me.username).toBe('testuser')
		expect(res.status).toBe(200)
	})
})
