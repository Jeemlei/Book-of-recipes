/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import mongoose from 'mongoose'
import config from '../../src/utils/config'
import UserSchema from '../../src/models/user'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from '../../src/graphql/schema'
import resolvers from '../../src/graphql/resolvers'

const testServer = new ApolloServer({
	typeDefs,
	resolvers
})

beforeAll(async () => {
	await mongoose.connect(config.MONGODB_URI as string)
})

beforeEach(async () => {
	await UserSchema.remove({})
	await new UserSchema({
		username: 'testuser',
		name: 'Test User',
		psswrd_hash: '$2b$10$2NHrQMiGkGeWKagbihAVse/84HLLeOTR/vpSiyWlmBALHzCVudcqm'
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
	})
})
