const path = require('path')
const chai = require('chai')
const Config = require('app/lib/core/config')
const filesys = require('app/lib/core/filesys')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename)

describe(specPath, () => {
	describe('module.exports', () => {
		it('should initialize with config object', () => {
			const argv = []
			const config = Config.init(argv)
			expect(config).to.be.an('object')
		})

		it('should load data from the Minkconf.js file', () => {
		})
	})

	describe('.getMinkconfRoot()', () => {
		it('user should be able to define a server root with cli args', () => {
			const userRoot = path.join(path.dirname(__filename))

			const argv = ['--dir', userRoot]
			const config = Config.init(argv)
			const relativeConf = path.relative(userRoot, config.MinkconfRoot)

			expect(config.MinkconfRoot).to.be.a('string')
			expect(relativeConf).to.equal('../..')
		})

		it('should default to nearest Minkconf.js if no args provded', () => {
			const argv = []
			const config = Config.init(argv)

			const specDirAbs = path.resolve(path.dirname(__filename))
			const MinkconfRootRel = path.relative(specDirAbs, config.MinkconfRoot)

			expect(config.MinkconfRoot).to.be.a('string')
			expect(MinkconfRootRel).to.equal('../..')
		})

		it('should use cwd as dir if no Minkconf.js is found', () => {
			const bogusPath = path.join(path.sep, 'totally', 'bogus', 'path')

			const argv = ['--dir', bogusPath]
			const config = Config.init(argv)

			expect(config.MinkconfRoot).to.be.a('string')
			expect(config.MinkconfRoot).to.equal(process.cwd())
		})

		it('should use cwd as dir if no Minkconf.js is found and no args are provided', () => {
			const originalCwd = process.cwd()
			const packageJsonUri = filesys.findFileUp(process.cwd(), 'package.json')
			const packageJsonDir = path.dirname(packageJsonUri)
			const outerDir = path.dirname(packageJsonDir)

			process.chdir(outerDir)

			const argv = []
			const config = Config.init(argv)

			// Put the dir back (CAREFUL!)
			process.chdir(originalCwd)

			expect(config.MinkconfRoot).to.be.a('string')
			expect(config.MinkconfRoot).to.equal(outerDir)
		})

		it('should use user provided dir as dir if no Minkconf.js is found and user provided dir exists', () => {
			const originalCwd = process.cwd()
			const packageJsonUri = filesys.findFileUp(process.cwd(), 'package.json')
			const packageJsonDir = path.dirname(packageJsonUri)
			const outerDir = path.dirname(packageJsonDir)

			process.chdir(outerDir)

			const argv = ['--dir', outerDir]
			const config = Config.init(argv)

			// Put the dir back (CAREFUL!)
			process.chdir(originalCwd)

			expect(config.MinkconfRoot).to.be.a('string')
			expect(config.MinkconfRoot).to.equal(outerDir)
		})
	})

	describe('.getMinkconfFile()', () => {
		it('should find the Mink global package Minkconf.js file if not dir is passed or the dir does contain a Minkconf.js file itself.', () => {
			// REASON: This is because we...

			const argv = []
			const config = Config.init(argv)

			const dir = path.join(path.dirname(__filename))

			// There will always be a Minkconf.js file in the package root
			const packageJsonUri = filesys.findFileUp(process.cwd(), 'package.json')
			const packageJsonDir = path.dirname(packageJsonUri)

			const MinkconfFileUri = config.getMinkconfFile(dir)

			expect(MinkconfFileUri).to.be.a('string')
			expect(MinkconfFileUri).to.equal(path.join(packageJsonDir, 'Minkconf.js'))
		})

		it('should find Minkconf.js when a dir is passed that has the Minkconf.js file in', () => {
		})
	})
})
