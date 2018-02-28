const path = require('path')
const chai = require('chai')
const Paths = require('app/lib/http/paths')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename)

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
			const [input, expected] = check
			it(`"${input}" should normalize to "${expected}"`, () => {
				const actual = paths.normalized(input)
				expect(actual).to.equal(expected)
			})
		})
	})

	describe('.directoryExists()', () => {
		const config = {}
		const paths = Paths(config)

		expect(paths).to.be.an('object')

		const checks = [
			// This is the current directory of this file
			// It should always exist
			['../http', true],

			// This directory is fictional
			['../https', false],

			// Stat a file that does exist (this file)
			// But make sure it's not a directory (it's not)
			['../http/paths.spec.js', false]
		]

		checks.forEach(check => {
			const [dir, exists] = check

			it(`"${dir}" should exist as a directory="${exists}"`, () => {
				const absDir = path.join(__dirname, dir)

				return paths.directoryExists(absDir).then(result => {
					expect(result).to.equal(exists)
				})
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
			const [input, expected] = check
			it(`"${input}" should resolve to "${expected}"`, () => {
				const actual = paths.absolute(input)
				expect(actual).to.equal(expected)
			})
		})
	})

	describe('.fileExists()', () => {
		const config = {}
		const paths = Paths(config)
		expect(paths).to.be.an('object')

		const checks = [
			// This is the current directory of this file
			// It should always exist, but not be a file
			['../http', false],

			// Stat a file that does exist (this file)
			['../http/paths.spec.js', true],

			// Stat a file that does NOT exist
			['../http/fake-news.js', false]
		]

		checks.forEach(check => {
			const [dir, exists] = check

			it(`"${dir}" should exist as a file="${exists}"`, () => {
				const absDir = path.join(__dirname, dir)

				return paths.fileExists(absDir).then(result => {
					expect(result).to.equal(exists)
				})
			})
		})
	})
})
