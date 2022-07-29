/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import supertest from 'supertest'
import app from '../src/app'
import mongoose from 'mongoose'
import config from '../src/utils/config'
import UserSchema from '../src/models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../src/utils/config'

const api = supertest(app)

let token = ''

beforeEach(async () => {
	await UserSchema.remove({})
	const psswrd_hash = await bcrypt.hash('password', 10)
	const user = await new UserSchema({
		username: 'testuser',
		name: 'Test User',
		psswrd_hash
	}).save()

	const userForToken = {
		username: user?.username,
		id: user?._id
	}

	token = jwt.sign(userForToken, JWT_SECRET as string, {
		expiresIn: '6h'
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})

describe('Routes', () => {
	test('redirect root path to frontend', async () => {
		const res = await api.get('/')
		expect(res.status).toBe(302)
		expect(res.header.location).toBe(`http://localhost:${config.FRONTEND_PORT}`)
	})
})

describe('GraphQL Query', () => {
	describe('User', () => {
		test('allUsers query returns list with all users', async () => {
			const query = {
				query: 'query Query { allUsers {username}}'
			}

			const res = await api.post('/api/graphql').send(query)

			expect(res.body.errors).toBeUndefined()
			expect(res.body.data?.allUsers.length).toBe(1)
			expect(res.body.data?.allUsers[0].username).toBe('testuser')
		})
		//------------------------------------------------
		test('find user by id', async () => {
			const user = await UserSchema.findOne({ username: 'testuser' })
			const id = user ? user.id : null

			const query = {
				query: 'query Query($id: String) { findUser(id: $id) {username} }',
				variables: { id: id as string }
			}

			const res = await api.post('/api/graphql').send(query)

			expect(res.body.errors).toBeUndefined()
			expect(res.body.data?.findUser.username).toBe('testuser')
		})
		//------------------------------------------------
		test('find user by username', async () => {
			const query = {
				query:
					'query Query($username: String) { findUser(username: $username) {name} }',
				variables: { username: 'testuser' }
			}

			const res = await api.post('/api/graphql').send(query)

			expect(res.body.errors).toBeUndefined()
			expect(res.body.data?.findUser.name).toBe('Test User')
		})
		//------------------------------------------------
		describe('findUser returns null when user does not exist:', () => {
			test('by username', async () => {
				const query = {
					query:
						'query Query($username: String) { findUser(username: $username) {username} }',
					variables: { username: 'nonexisting' }
				}
				const res = await api.post('/api/graphql').send(query)

				expect(res.body.errors).toBeUndefined()
				expect(res.body.data?.findUser).toBeNull()
			})
			test('by id', async () => {
				const query = {
					query: 'query Query($id: String) { findUser(id: $id) {username} }',
					variables: { id: '000000000000000000000000' }
				}

				const res = await api.post('/api/graphql').send(query)

				expect(res.body.errors).toBeUndefined()
				expect(res.body.data?.findUser).toBeNull()
			})
		})
		//------------------------------------------------
		describe('findUser returns UserInputError when the provided id is incorrect:', () => {
			test('too short', async () => {
				const query = {
					query: 'query Query($id: String) { findUser(id: $id) {username} }',
					variables: { id: 'a' }
				}

				const res = await api.post('/api/graphql').send(query)
				const error = res.body.errors?.slice(0, 1)[0]

				expect(error?.message).toBe('id must be length 24 (length was 1)')
				expect(error?.extensions?.invalidArgs).toBe('a')
				expect(error?.extensions?.code).toBe('BAD_USER_INPUT')
				expect(res.body.data?.findUser).toBeNull()
			})
			test('too long', async () => {
				const query = {
					query: 'query Query($id: String) { findUser(id: $id) {username} }',
					variables: { id: 'aaaaaaaaaaaaaaaaaaaaaaaaa' }
				}
				const res = await api.post('/api/graphql').send(query)

				const error = res.body.errors?.slice(0, 1)[0]

				expect(error?.message).toBe('id must be length 24 (length was 25)')
				expect(error?.extensions?.invalidArgs).toBe('aaaaaaaaaaaaaaaaaaaaaaaaa')
				expect(error?.extensions?.code).toBe('BAD_USER_INPUT')
				expect(res.body.data?.findUser).toBeNull()
			})
		})
		//------------------------------------------------
		test('findUser returns UserInputError when the provided id contains nonhexadecimal symbols', async () => {
			const query = {
				query: 'query Query($id: String) { findUser(id: $id) {username} }',
				variables: { id: 'aaaaaaaaaaaagaaaaaaaaaaa' }
			}

			const res = await api.post('/api/graphql').send(query)

			const error = res.body.errors?.slice(0, 1)[0]

			expect(error?.message).toBe('id must only include hexadecimal symbols')
			expect(error?.extensions?.invalidArgs).toBe('aaaaaaaaaaaagaaaaaaaaaaa')
			expect(error?.extensions?.code).toBe('BAD_USER_INPUT')
			expect(res.body.data?.findUser).toBeNull()
		})
		//------------------------------------------------
		describe('findUser returns ValidationError when incorrect number of search arguments are provided:', () => {
			test('too many', async () => {
				const query = {
					query:
						'query Query($id: String, $username: String) { findUser(id: $id, username: $username) {username} }',
					variables: { id: 'a', username: 'a' }
				}

				const res = await api.post('/api/graphql').send(query)

				const error = res.body.errors?.slice(0, 1)[0]

				expect(error?.message).toBe(
					'findUser: one and oly one of the optional search arguments must be provided'
				)
				expect(error?.extensions?.code).toBe('GRAPHQL_VALIDATION_FAILED')
				expect(res.body.data?.findUser).toBeNull()
			})
			test('not enough', async () => {
				const query = {
					query: 'query Query { findUser {username} }'
				}
				const res = await api.post('/api/graphql').send(query)

				const error = res.body.errors?.slice(0, 1)[0]

				expect(error?.message).toBe(
					'findUser: one and oly one of the optional search arguments must be provided'
				)
				expect(error?.extensions?.code).toBe('GRAPHQL_VALIDATION_FAILED')
				expect(res.body.data?.findUser).toBeNull()
			})
		})
		//------------------------------------------------
		test('query me returns null if authorization header missing', async () => {
			const query = {
				query: `query Query {
					me {
						username
					}
				}`
			}
			const res = await api.post('/api/graphql').send(query)
			expect(res.body.data.me).toBeNull()
			expect(res.status).toBe(200)
		})
		//------------------------------------------------
		test('query me returns user if authorization header has correct token', async () => {
			const query = {
				query: `query Query {
					me {
						username
					}
				}`
			}

			const res = await api
				.post('/api/graphql')
				.set('Authorization', `bearer ${token}`)
				.send(query)

			expect(res.body.data.me.username).toBe('testuser')
			expect(res.status).toBe(200)
		})
	})
})

describe('GraphQL Mutation', () => {
	describe('User', () => {
		describe('a new user can be created:', () => {
			test('without name', async () => {
				const query = {
					query: `mutation Mutation($username: String!, $password: String!) {
						createUser(username: $username, password: $password) { 
							id,
							username, 
							name 
						} 
					}`,
					variables: {
						username: 'newuser',
						password: 'password'
					}
				}

				const res = await api.post('/api/graphql').send(query)

				expect(res.body.errors).toBeUndefined()
				expect(res.body.data?.createUser.id).toBeDefined()
				expect(res.body.data?.createUser.name).toBeNull()
				expect(res.body.data?.createUser.username).toBe('newuser')
			})
			test('with name', async () => {
				const query = {
					query: `mutation Mutation($username: String!, $password: String!, $name: String) {
					createUser(username: $username, password: $password, name: $name) { 
						id,
						username, 
						name 
					} 
				}`,
					variables: {
						username: 'newuser',
						password: 'password',
						name: 'New User'
					}
				}

				const res = await api.post('/api/graphql').send(query)

				expect(res.body.errors).toBeUndefined()
				expect(res.body.data?.createUser.id).toBeDefined()
				expect(res.body.data?.createUser.name).toBe('New User')
				expect(res.body.data?.createUser.username).toBe('newuser')
			})
		})
		//------------------------------------------------
		test('new user can not be created if username exists', async () => {
			const query = {
				query: `mutation Mutation($username: String!, $password: String!) {
					createUser(username: $username, password: $password) { 
						id,
						username, 
						name 
					} 
				}`,
				variables: {
					username: 'testuser',
					password: 'password'
				}
			}

			const res = await api.post('/api/graphql').send(query)

			const error = res.body.errors?.slice(0, 1)[0]

			expect(error?.message).toBe(
				'User validation failed: username: Error, expected `username` to be unique. Value: `testuser`'
			)
			expect(res.body.data?.createUser).toBeNull()
		})
		//------------------------------------------------
		test('user can log in', async () => {
			const query = {
				query: `mutation Mutation($username: String!, $password: String!) {
					login(username: $username, password: $password) { 
						token
					} 
				}`,
				variables: { username: 'testuser', password: 'password' }
			}

			const res = await api.post('/api/graphql').send(query)

			expect(res.body.errors).toBeUndefined()
			expect(res.body.data?.login.token).toBeDefined()
		})
		//------------------------------------------------
		describe('log in fails with wrong credentials:', () => {
			test('username', async () => {
				const query = {
					query: `mutation Mutation($username: String!, $password: String!) {
					login(username: $username, password: $password) { 
						token
					} 
				}`,
					variables: { username: 'nonexistinguser', password: 'password' }
				}

				const res = await api.post('/api/graphql').send(query)

				const error = res.body.errors?.slice(0, 1)[0]

				expect(error?.message).toBe('wrong username or password')
				expect(error?.extensions?.code).toBe('BAD_USER_INPUT')
				expect(res.body.data?.login).toBeNull()
			})
			test('password', async () => {
				const query = {
					query: `mutation Mutation($username: String!, $password: String!) {
					login(username: $username, password: $password) { 
						token
					} 
				}`,
					variables: { username: 'testuser', password: 'wrong' }
				}

				const res = await api.post('/api/graphql').send(query)

				const error = res.body.errors?.slice(0, 1)[0]

				expect(error?.message).toBe('wrong username or password')
				expect(error?.extensions?.code).toBe('BAD_USER_INPUT')
				expect(res.body.data?.login).toBeNull()
			})
		})
		//------------------------------------------------
		describe('user can update:', () => {
			test('username', async () => {
				const query = {
					query: `mutation Mutation($username: String) {
					updateUser(username: $username) { 
						username
					} 
				}`,
					variables: { username: 'newusername' }
				}

				const res = await api
					.post('/api/graphql')
					.set('Authorization', `bearer ${token}`)
					.send(query)

				expect(res.body.errors).toBeUndefined()
				expect(res.body.data?.updateUser.username).toBe('newusername')
				expect(await UserSchema.collection.countDocuments()).toBe(1)
			})
			test('password', async () => {
				const newPassword = 'newpassword'
				const query = {
					query: `mutation Mutation($password: String) {
					updateUser(password: $password) { 
						username
					} 
				}`,
					variables: { password: newPassword }
				}

				const res = await api
					.post('/api/graphql')
					.set('Authorization', `bearer ${token}`)
					.send(query)

				const user = await UserSchema.findOne({ username: 'testuser' })
				const psswrd_hash = user ? user.psswrd_hash : ''

				expect(res.body.errors).toBeUndefined()
				expect(await bcrypt.compare(newPassword, psswrd_hash)).toBe(true)
				expect(await UserSchema.collection.countDocuments()).toBe(1)
			})
			test('name', async () => {
				const query = {
					query: `mutation Mutation($name: String) {
					updateUser(name: $name) { 
						username
						name
					} 
				}`,
					variables: { name: 'New Name' }
				}

				const res = await api
					.post('/api/graphql')
					.set('Authorization', `bearer ${token}`)
					.send(query)

				expect(res.body.errors).toBeUndefined()
				expect(res.body.data?.updateUser.username).toBe('testuser')
				expect(res.body.data?.updateUser.name).toBe('New Name')
				expect(await UserSchema.collection.countDocuments()).toBe(1)
			})
			test('multiple values', async () => {
				const newPassword = 'newpassword'
				const query = {
					query: `mutation Mutation($username: String, $name: String, $password: String) {
					updateUser(username: $username, name: $name, password: $password) { 
						username
						name
					} 
				}`,
					variables: {
						username: 'newusername',
						name: 'New Name',
						password: 'newpassword'
					}
				}

				const res = await api
					.post('/api/graphql')
					.set('Authorization', `bearer ${token}`)
					.send(query)

				const user = await UserSchema.findOne({ username: 'newusername' })
				const psswrd_hash = user ? user.psswrd_hash : ''

				expect(res.body.errors).toBeUndefined()
				expect(await bcrypt.compare(newPassword, psswrd_hash)).toBe(true)
				expect(res.body.data?.updateUser.username).toBe('newusername')
				expect(res.body.data?.updateUser.name).toBe('New Name')

				expect(await UserSchema.collection.countDocuments()).toBe(1)
			})
		})
		//------------------------------------------------
		test('user can not update account if not authenticated', async () => {
			const newPassword = 'newpassword'
			const query = {
				query: `mutation Mutation($username: String, $name: String, $password: String) {
					updateUser(username: $username, name: $name, password: $password) { 
						username
						name
					} 
				}`,
				variables: {
					username: 'newusername',
					name: 'New Name',
					password: newPassword
				}
			}

			const res = await api.post('/api/graphql').send(query)

			const error = res.body.errors?.slice(0, 1)[0]

			expect(error?.message).toBe('not authenticated')
			expect(error?.extensions?.code).toBe('UNAUTHENTICATED')
			expect(res.body.data?.updateUser).toBeNull()
		})
		//------------------------------------------------
		test('user can delete account', async () => {
			const query = {
				query: `mutation {
				deleteUser { 
					username
				} 
			}`
			}

			const res = await api
				.post('/api/graphql')
				.set('Authorization', `bearer ${token}`)
				.send(query)

			expect(res.body.errors).toBeUndefined()
			expect(res.body.data?.deleteUser.username).toBe('testuser')
			expect(await UserSchema.collection.countDocuments()).toBe(0)
		})
		//------------------------------------------------
		test('user can not delete account if not authenticated', async () => {
			await UserSchema.findOneAndRemove({ username: 'testuser' })
			const query = {
				query: `mutation {
				deleteUser { 
					username
				} 
			}`
			}

			const res = await api.post('/api/graphql').send(query)

			const error = res.body.errors?.slice(0, 1)[0]

			expect(error?.message).toBe('not authenticated')
			expect(error?.extensions?.code).toBe('UNAUTHENTICATED')
			expect(res.body.data?.deleteUser).toBeNull()
		})
	})
})
