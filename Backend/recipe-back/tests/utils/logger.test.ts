import logger from '../../src/utils/logger'

const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

describe('No logging during test runs', () => {
	beforeEach(() => {
		consoleSpy.mockClear()
	})

	test('Info log', () => {
		const log = console.log
		logger.info('test')
		expect(log).not.toBeCalled()
	})

	test('Error log', () => {
		logger.error('test')
		expect(console.error).not.toBeCalled()
	})
})
