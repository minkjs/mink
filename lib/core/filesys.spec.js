const path = require('path')
const chai = require('chai')
const Filesys = require('app/lib/core/filesys')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename).split('.spec')[0] + '.js'

describe(specPath, () => {
	describe('.dirExistsSync()', () => {
		const filesys = Filesys()

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

	describe('.fileExistsSync()', () => {
		const config = {}
		const filesys = Filesys(config)

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

	describe('.findFileUp()', () => {
		const filesys = Filesys()

		expect(filesys).to.be.an('object')

		it(`package.json should exist 3 levels up`, () => {
			const packageJsonUri = filesys.findFileUp(__dirname, 'package.json')
			const actual = path.relative(__dirname, packageJsonUri)
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
