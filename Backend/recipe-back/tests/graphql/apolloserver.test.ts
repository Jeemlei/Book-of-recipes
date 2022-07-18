/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import mongoose from 'mongoose'
import config from '../../src/utils/config'
import UserSchema from '../../src/models/user'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from '../../src/graphql/schema'
import resolvers from '../../src/graphql/resolvers'

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

describe('GraphQL User', () => {
	test('allUsers query returns list with all users', async () => {
		const testServer = new ApolloServer({
			typeDefs,
			resolvers
		})

		const result = await testServer.executeOperation({
			query: 'query Query { allUsers {username}}'
		})

		expect(result.errors).toBeUndefined()
		expect(result.data?.allUsers.length).toBe(1)
		expect(result.data?.allUsers[0].username).toBe('testuser')
	})

	test('find user by id', async () => {
		const testServer = new ApolloServer({
			typeDefs,
			resolvers
		})

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

	test('find user by username', async () => {
		const testServer = new ApolloServer({
			typeDefs,
			resolvers
		})

		const result = await testServer.executeOperation({
			query:
				'query Query($username: String) { findUser(username: $username) {name} }',
			variables: { username: 'testuser' }
		})

		expect(result.errors).toBeUndefined()
		expect(result.data?.findUser.name).toBe('Test User')
	})
})
