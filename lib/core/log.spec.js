const chai = require('chai')
const log = require('app/lib/core/log')

const expect = chai.expect

describe('log', () => {
	describe('constructor', () => {
		it('should initialize', () => {
			expect(log).to.be.an('object')
		})
	})

	describe('enums', () => {
		it('should match', () => {
			const expected = [
				'0',
				'1',
				'2',
				'3',
				'4',
				'5',
				'TRACE',
				'DEBUG',
				'INFO',
				'WARN',
				'ERROR',
				'FATAL'
			]

			Reflect.ownKeys(log.levels).forEach((key, i) => {
				expect(key).to.equal(expected[i])
			})
		})
	})
})
