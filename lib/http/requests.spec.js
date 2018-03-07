const path = require('path')

const chai = require('chai')

const Requests = require('app/lib/http/requests')
const configMock = require('app/mock/config.log')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename)

describe(specPath, () => {
	describe('RequestsConstructor()', () => {
		it(`should instantiate`, () => {
			const requests = Requests(configMock)
			expect(requests).to.be.an('object')
		})
	})

	describe('.resourceExists()', () => {
		it(`should find existent file`, () => {
			const requests = Requests(configMock)
			const uri = __filename
			return requests.resourceExists(uri).then(result => {
				expect(result).to.be.a('string')
				expect(result).to.equal('file')
			})
		})

		it(`should find existent dir`, () => {
			const requests = Requests(configMock)
			const uri = __dirname
			return requests.resourceExists(uri).then(result => {
				expect(result).to.be.a('string')
				expect(result).to.equal('dir')
			})
		})

		it(`should NOT find non-existent file`, () => {
			const requests = Requests(configMock)
			const uri = path.join(__dirname, 'foobar.baz')
			return requests.resourceExists(uri).then(result => {
				expect(result).to.be.a('boolean')
				expect(result).to.equal(false)
			})
		})

		// Perhaps redudant: same codepath as searching for the file
		// unless the directory state encounters a fs read error.
		it(`should NOT find non-existent dir`, () => {
			const requests = Requests(configMock)
			const uri = path.join(__dirname, 'foo/bar/baz/')
			return requests.resourceExists(uri).then(result => {
				expect(result).to.be.a('boolean')
				expect(result).to.equal(false)
			})
		})
	})

	describe('.handlUri()', () => {
		it('should handle plugins returning html payloads', () => {
			const requests = Requests(configMock)

			const mockPayload = {
				code: 200,
				headers: {
					'Content-Type': 'text/html'
				},
				body: '<div><h1>Test</h1></div>'
			}

			const mockPluginHandler = {
				callback: () => new Promise(resolve => {
					resolve(mockPayload)
				})
			}

			const mockRes = {}
			const uri = ''

			return requests.handleUri(mockPluginHandler, uri, mockRes)
			.then(result => {
				expect(result).to.be.an('object')
				expect(result.payload.code).to.be.a('number')
				expect(result.payload.code).to.equal(200)
				expect(result.payload.headers).to.be.an('object')
				expect(result.payload.headers['Content-Type']).to.be.a('string')
				expect(result.payload.headers['Content-Type']).to.equal('text/html')
				expect(result.payload.body).to.be.a('string')
				expect(result.payload.body).to.equal(mockPayload.body)
				expect(result.finalHtml).to.be.a('string')
				expect(result.finalHtml).to.equal(mockPayload.body)
				expect(result.res).to.be.an('object')
			})
		})

		it('should handle plugins with internal res writes', () => {
			const requests = Requests(configMock)

			const mockPluginHandler = {
				callback: () => new Promise(resolve => {
					resolve(null)
				})
			}

			return requests.handleUri(mockPluginHandler)
			.then(result => {
				// eslint-disable-next-line no-unused-expressions
				expect(result).to.be.null
			})
		})

		it('should handle plugins with handlebars templates', () => {
			const requests = Requests(configMock)

			const mockPayload = {
				code: 200,
				headers: {
					'Content-Type': 'text/html'
				},
				data: {
					content: '<p>This is content</p>'
				}
			}

			const mockPluginHandler = {
				callback: () => new Promise(resolve => {
					resolve(mockPayload)
				}),
				template: '<article>{{{content}}}</article>'
			}

			const mockRes = {}
			const uri = ''

			return requests.handleUri(mockPluginHandler, uri, mockRes)
			.then(result => {
				expect(result).to.be.an('object')
				expect(result.payload.code).to.be.a('number')
				expect(result.payload.code).to.equal(200)
				expect(result.payload.headers).to.be.an('object')
				expect(result.payload.headers['Content-Type']).to.be.a('string')
				expect(result.payload.headers['Content-Type']).to.equal('text/html')
				expect(result.payload.data).to.be.an('object')
				expect(result.payload.data.content).to.be.a('string')
				expect(result.payload.data.content).to.equal('<p>This is content</p>')
				expect(result.finalHtml).to.be.a('string')
				expect(result.finalHtml).to.equal('<article><p>This is content</p></article>')
				expect(result.res).to.be.an('object')
			})
		})
	})

	describe('.findMatchingModule()', () => {
		it('should find a module', () => {
			const requests = Requests(configMock)

			const routesMock = {
				handlers: {
					foo: {
						pattern: '**/*.foo',
						module: {
							foo: 'bar'
						}
					}
				}
			}

			const matchableUri = '/usr/foo/bar/baz.foo'

			const matchingModule = requests
				.findMatchingModule(matchableUri, routesMock)

			expect(matchingModule).to.be.an('object')
			expect(matchingModule.module).to.be.an('object')
			expect(matchingModule.module.foo).to.be.a('string')
			expect(matchingModule.module.foo).to.equal('bar')
		})
	})
})
