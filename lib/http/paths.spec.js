const path = require('path')
const chai = require('chai')
const Paths = require('app/lib/http/paths')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename).split('.spec')[0] + '.js'

describe(specPath, () => {
	describe('.normalize()', () => {
		const config = {}
		const paths = Paths(config)

		expect(paths).to.be.an('object')

		const checks = [
			['/../something', '/something'],
			['../something', '../something'],
			['./abc/../abc', 'abc']
		]

		checks.forEach(check => {
			const input = check[0]
			const expected = check[1]
			it(`"${input}" should normalize to "${expected}"`, () => {
				const actual = paths.normalized(input)
				expect(actual).to.equal(expected)
			})
		})
	})

	describe('.absolute()', () => {
		const MinkconfRoot = '/Users/user/dir'
		const config = {MinkconfRoot}
		const paths = Paths(config)

		expect(paths).to.be.an('object')

		const checks = [
			['/', '/Users/user/dir/'],
			['/test/', '/Users/user/dir/test/'],
			['test/', '/Users/user/dir/test/'],
			['test', '/Users/user/dir/test'],
			['../test/', '/Users/user/test/']
		]

		checks.forEach(check => {
			const input = check[0]
			const expected = check[1]
			it(`"${input}" should resolve to "${expected}"`, () => {
				const actual = paths.absolute(input)
				expect(actual).to.equal(expected)
			})
		})
	})
})
