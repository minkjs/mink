const path = require('path')
const chai = require('chai')
const filesys = require('app/lib/core/filesys')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename).split('.spec')[0] + '.js'

describe(specPath, () => {
	describe('.dirExistsSync()', () => {
		expect(filesys).to.be.an('object')

		it(`"${__dirname}" should exist`, () => {
			const actual = filesys.dirExistsSync(__dirname)
			expect(actual).to.equal(true)
		})

		const bogusDir = path.join(__dirname, 'bogus')
		it(`"${bogusDir}" should not exist`, () => {
			const actual = filesys.dirExistsSync(bogusDir)
			expect(actual).to.equal(false)
		})
	})

	describe('.directoryExists()', () => {
		const checks = [
			// This is the current directory of this file
			// It should always exist
			['../core', true],

			// This directory is fictional
			['../foobar', false],

			// Stat a file that does exist (this file)
			// But make sure it's not a directory (it's not)
			['../core/paths.spec.js', false]
		]

		checks.forEach(check => {
			const [dir, exists] = check

			it(`"${dir}" should exist as a directory="${exists}"`, () => {
				const absDir = path.join(__dirname, dir)

				return filesys.directoryExists(absDir).then(result => {
					expect(result).to.equal(exists)
				})
			})
		})
	})

	describe('.fileExistsSync()', () => {
		expect(filesys).to.be.an('object')

		it(`"${__filename}" should exist`, () => {
			const actual = filesys.fileExistsSync(__filename)
			expect(actual).to.equal(true)
		})

		const bogusFile = path.join(__dirname, 'bogus-file.js')
		it(`"${bogusFile}" should not exist`, () => {
			const actual = filesys.fileExistsSync(bogusFile)
			expect(actual).to.equal(false)
		})
	})

	describe('.fileExists()', () => {
		const checks = [
			// This is the current directory of this file
			// It should always exist, but not be a file
			['../core', false],

			// Stat a file that does exist (this file)
			['../core/filesys.spec.js', true],

			// Stat a file that does NOT exist
			['../core/fake-news.js', false]
		]

		checks.forEach(check => {
			const [dir, exists] = check

			it(`"${dir}" should exist as a file="${exists}"`, () => {
				const absDir = path.join(__dirname, dir)

				return filesys.fileExists(absDir).then(result => {
					expect(result).to.equal(exists)
				})
			})
		})
	})

	describe('.findFileUp()', () => {
		expect(filesys).to.be.an('object')

		it(`package.json should exist 3 levels up`, () => {
			const packageJsonUri = filesys.findFileUp(__dirname, 'package.json')
			console.log(packageJsonUri)
			const actual = path.relative(__dirname, packageJsonUri)
			console.log(actual)
			expect(actual).to.equal('../../package.json')
		})

		it(`Minkconf.js should exist 1 level up`, () => {
			const minkconfUri = filesys.findFileUp(__dirname, 'Minkconf.js')
			const actual = path.relative(__dirname, minkconfUri)
			expect(actual).to.equal('../../Minkconf.js')
		})

		it(`should return false where file doest not exist up to root`, () => {
			const nonExistantFile = filesys.findFileUp(__dirname, 'bogus-file.js')
			expect(nonExistantFile).to.equal(false)
		})
	})
})
