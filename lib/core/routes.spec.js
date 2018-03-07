const path = require('path')
const chai = require('chai')
const Routes = require('app/lib/core/routes')
const configMock = require('app/mock/config.log')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename)

describe(specPath, () => {
	describe('Instantiation', () => {
		expect(Routes).to.be.an('function')
		const routes = Routes(configMock)
		expect(routes).to.be.an('object')
	})

	describe('.getModuleType(name)', () => {
		it('correctly identifies a Node Module', () => {
			const routes = Routes(configMock)
			const moduleType = routes.getModuleType('less')
			expect(moduleType).to.be.a('string')
			expect(moduleType).to.equal('nodeModule')
		})

		it('identifies local JS files starting w/ [a-z] chars', () => {
			const routes = Routes(configMock)
			const moduleType = routes.getModuleType('lib/something.js')
			expect(moduleType).to.be.a('string')
			expect(moduleType).to.equal('localJavaScript')
		})

		it('identifies local JS files starting w/ period chars', () => {
			const routes = Routes(configMock)
			const moduleType = routes.getModuleType('./lib/something.js')
			expect(moduleType).to.be.a('string')
			expect(moduleType).to.equal('localJavaScript')
		})
	})

	describe('.loadModule.localJavaScript()', () => {
		it('should fail to load a non-existant local JS file', () => {
			const routes = Routes(configMock)
			expect(() => {
				routes.moduleLoaders.localJavaScript('./foo/', 'bar')
			})
			.to.throw('Cannot find module \'foo/bar\'')
		})
	})

	describe('.loadModule.nodeModule()', () => {
		it('should fail to load a non-existent Node Module', () => {
			const routes = Routes(configMock)
			const nonExistentModule = 'foobar-' + Number(new Date())
			expect(() => {
				routes.moduleLoaders.nodeModule(nonExistentModule)
			})
			// .to.throw(`Cannot find module '${nonExistentModule}'`)
		})
	})
})
