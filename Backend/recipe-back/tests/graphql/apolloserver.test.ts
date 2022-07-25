/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import mongoose from 'mongoose'
import config from '../../src/utils/config'
import UserSchema from '../../src/models/user'
import bcrypt from 'bcrypt'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from '../../src/graphql/schema'
import resolvers from '../../src/graphql/resolvers'

const testServer = new ApolloServer({
	typeDefs,
	resolvers,
	context: async () => {
		const currentUser = await UserSchema.findOne({ username: 'testuser' })
		return {
			currentUser
		}
	}
})

beforeAll(async () => {
	await mongoose.connect(config.MONGODB_URI as string)
})

beforeEach(async () => {
	await UserSchema.remove({})
	const psswrd_hash = await bcrypt.hash('password', 10)
	await new UserSchema({
		username: 'testuser',
		name: 'Test User',
		psswrd_hash
	}).save()
})

afterAll(async () => {
	await mongoose.connection.close()
})

describe('GraphQL Query', () => {
	describe('User', () => {
		test('allUsers query returns list with all users', async () => {
			const result = await testServer.executeOperation({
				query: 'query Query { allUsers {username}}'
			})

			expect(result.errors).toBeUndefined()
			expect(result.data?.allUsers.length).toBe(1)
			expect(result.data?.allUsers[0].username).toBe('testuser')
		})
		//------------------------------------------------
		test('find user by id', async () => {
			const idResult = await testServer.executeOperation({
				query: 'query Query { allUsers {id} }'
			})

			const result = await testServer.executeOperation({
				query: 'query Query($id: String) { findUser(id: $id) {username} }',
				variables: { id: idResult.data?.allUsers[0].id as string }
			})

			expect(result.errors).toBeUndefined()
			expect(result.data?.findUser.username).toBe('testuser')
		})
		//------------------------------------------------
		test('find user by username', async () => {
			const result = await testServer.executeOperation({
				query:
					'query Query($username: String) { findUser(username: $username) {name} }',
				variables: { username: 'testuser' }
			})

			expect(result.errors).toBeUndefined()
			expect(result.data?.findUser.name).toBe('Test User')
		})
		//------------------------------------------------
		test('findUser returns null when user does not exist', async () => {
			const resultUsername = await testServer.executeOperation({
				query:
					'query Query($username: String) { findUser(username: $username) {username} }',
				variables: { username: 'nonexisting' }
			})

			expect(resultUsername.errors).toBeUndefined()
			expect(resultUsername.data?.findUser).toBeNull()

			const resultId = await testServer.executeOperation({
				query: 'query Query($id: String) { findUser(id: $id) {username} }',
				variables: { id: '000000000000000000000000' }
			})

			expect(resultId.errors).toBeUndefined()
			expect(resultId.data?.findUser).toBeNull()
		})
		//------------------------------------------------
		test('findUser returns UserInputError when the provided id is too short or too long', async () => {
			const resultShort = await testServer.executeOperation({
				query: 'query Query($id: String) { findUser(id: $id) {username} }',
				variables: { id: 'a' }
			})

			let error = resultShort.errors?.slice(0, 1)[0]

			expect(error?.message).toBe('id must be length 24 (length was 1)')
			expect(error?.extensions?.invalidArgs).toBe('a')
			expect(error?.extensions?.code).toBe('BAD_USER_INPUT')
			expect(resultShort.data?.findUser).toBeNull()

			const resultLong = await testServer.executeOperation({
				query: 'query Query($id: String) { findUser(id: $id) {username} }',
				variables: { id: 'aaaaaaaaaaaaaaaaaaaaaaaaa' }
			})

			error = resultLong.errors?.slice(0, 1)[0]

			expect(error?.message).toBe('id must be length 24 (length was 25)')
			expect(error?.extensions?.invalidArgs).toBe('aaaaaaaaaaaaaaaaaaaaaaaaa')
			expect(error?.extensions?.code).toBe('BAD_USER_INPUT')
			expect(resultLong.data?.findUser).toBeNull()
		})
		//------------------------------------------------
		test('findUser returns UserInputError when the provided id contains nonhexadecimal symbols', async () => {
			const resultShort = await testServer.executeOperation({
				query: 'query Query($id: String) { findUser(id: $id) {username} }',
				variables: { id: 'aaaaaaaaaaaagaaaaaaaaaaa' }
			})

			const error = resultShort.errors?.slice(0, 1)[0]

			expect(error?.message).toBe('id must only include hexadecimal symbols')
			expect(error?.extensions?.invalidArgs).toBe('aaaaaaaaaaaagaaaaaaaaaaa')
			expect(error?.extensions?.code).toBe('BAD_USER_INPUT')
			expect(resultShort.data?.findUser).toBeNull()
		})
		//------------------------------------------------
		test('findUser returns ValidationError when incorrect number of search arguments are provided', async () => {
			const resultTooMany = await testServer.executeOperation({
				query:
					'query Query($id: String, $username: String) { findUser(id: $id, username: $username) {username} }',
				variables: { id: 'a', username: 'a' }
			})

			let error = resultTooMany.errors?.slice(0, 1)[0]

			expect(error?.message).toBe(
				'findUser: one and oly one of the optional search arguments must be provided'
			)
			expect(error?.extensions?.code).toBe('GRAPHQL_VALIDATION_FAILED')
			expect(resultTooMany.data?.findUser).toBeNull()

			const resultNotEnough = await testServer.executeOperation({
				query: 'query Query { findUser {username} }'
			})

			error = resultNotEnough.errors?.slice(0, 1)[0]

			expect(error?.message).toBe(
				'findUser: one and oly one of the optional search arguments must be provided'
			)
			expect(error?.extensions?.code).toBe('GRAPHQL_VALIDATION_FAILED')
			expect(resultNotEnough.data?.findUser).toBeNull()
		})
		//------------------------------------------------
		test('me returns user from context', async () => {
			const result = await testServer.executeOperation({
				query: `query Query {
						me {
							username  
						}
					}`
			})
			expect(result.errors).toBeUndefined()
			expect(result.data?.me.username).toBe('testuser')
		})
	})
})

describe('GraphQL Mutation', () => {
	describe('User', () => {
		describe('a new user can be created:', () => {
			test('without name', async () => {
				const result = await testServer.executeOperation({
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
				})

				expect(result.errors).toBeUndefined()
				expect(result.data?.createUser.id).toBeDefined()
				expect(result.data?.createUser.name).toBeNull()
				expect(result.data?.createUser.username).toBe('newuser')
			})
			test('with name', async () => {
				const result = await testServer.executeOperation({
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
				})

				expect(result.errors).toBeUndefined()
				expect(result.data?.createUser.id).toBeDefined()
				expect(result.data?.createUser.name).toBe('New User')
				expect(result.data?.createUser.username).toBe('newuser')
			})
		})
		//------------------------------------------------
		test('new user can not be created if username exists', async () => {
			const result = await testServer.executeOperation({
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
			})

			const error = result.errors?.slice(0, 1)[0]

			expect(error?.message).toBe(
				'User validation failed: username: Error, expected `username` to be unique. Value: `testuser`'
			)
			expect(result.data?.createUser).toBeNull()
		})
		//------------------------------------------------
		test('user can log in', async () => {
			const result = await testServer.executeOperation({
				query: `mutation Mutation($username: String!, $password: String!) {
					login(username: $username, password: $password) { 
						token
					} 
				}`,
				variables: { username: 'testuser', password: 'password' }
			})
			expect(result.errors).toBeUndefined()
			expect(result.data?.login.token).toBeDefined()
		})
		//------------------------------------------------
		describe('log in fails with wrong credentials:', () => {
			test('username', async () => {
				const result = await testServer.executeOperation({
					query: `mutation Mutation($username: String!, $password: String!) {
					login(username: $username, password: $password) { 
						token
					} 
				}`,
					variables: { username: 'notexistinguser', password: 'password' }
				})

				const error = result.errors?.slice(0, 1)[0]

				expect(error?.message).toBe('wrong username or password')
				expect(error?.extensions?.code).toBe('BAD_USER_INPUT')
				expect(result.data?.login).toBeNull()
			})
			test('password', async () => {
				const result = await testServer.executeOperation({
					query: `mutation Mutation($username: String!, $password: String!) {
					login(username: $username, password: $password) { 
						token
					} 
				}`,
					variables: { username: 'testuser', password: 'wrong' }
				})

				const error = result.errors?.slice(0, 1)[0]

				expect(error?.message).toBe('wrong username or password')
				expect(error?.extensions?.code).toBe('BAD_USER_INPUT')
				expect(result.data?.login).toBeNull()
			})
		})
	})
})
