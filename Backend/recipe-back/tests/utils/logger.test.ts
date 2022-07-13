import logger from '../../src/utils/logger'

jest.spyOn(console, 'log').mockImplementation()
jest.spyOn(console, 'error').mockImplementation()

describe('No logging during test runs', () => {
	test('Info log', () => {
		logger.info('test')
		expect(console.log).not.toBeCalled()
	})

	test('Error log', () => {
		logger.error('test')
		expect(console.error).not.toBeCalled()
	})
})
