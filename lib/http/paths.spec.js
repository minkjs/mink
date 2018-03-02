const path = require('path')
const chai = require('chai')
const paths = require('app/lib/http/paths')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename)

describe(specPath, () => {
	describe('.normalize()', () => {
		const checks = [
			['/../something', '/something'],
			['../something', '../something'],
			['./abc/../abc', 'abc']
		]

		checks.forEach(check => {
			const [input, expected] = check
			it(`"${input}" should normalize to "${expected}"`, () => {
				const actual = paths.normalized(input)
				expect(actual).to.equal(expected)
			})
		})
	})

	describe('.absolute()', () => {
		const base = '/Users/user/dir'

		const checks = [
			['/', '/Users/user/dir/'],
			['/test/', '/Users/user/dir/test/'],
			['test/', '/Users/user/dir/test/'],
			['test', '/Users/user/dir/test'],
			['../test/', '/Users/user/test/']
		]

		checks.forEach(check => {
			const [input, expected] = check
			it(`"${input}" should resolve to "${expected}"`, () => {
				const actual = paths.absolute(base, input)
				expect(actual).to.equal(expected)
			})
		})
	})
})
