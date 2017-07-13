const path = require('path')
const http = require('http')

const chai = require('chai')
const portfinder = require('portfinder')

const Server = require('app/lib/http/server')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename).split('.spec')[0] + '.js'

describe(specPath, () => {
	describe('.configure()', () => {
		it(`should start with null configuration`, () => {
			const server = Server()
			expect(server).to.be.an('object')
			expect(server.config).to.be.an('object')
			expect(server.config.protocol).to.equal(null)
			expect(server.config.port).to.equal(null)
			expect(server.config.host).to.equal(null)
			expect(server.config.handler).to.equal(null)
		})

		it(`should store configuration`, () => {
			const server = Server()
			expect(server).to.be.an('object')

			const serverConfig = {
				protocol: 'http',
				port: 8001,
				host: 'localhost',
				handler: () => {}
			}

			server.configure(serverConfig)

			expect(server.config).to.be.an('object')
			expect(server.config.protocol).to.equal('http')
			expect(server.config.port).to.equal(8001)
			expect(server.config.host).to.equal('localhost')
			expect(server.config.handler).to.be.a('function')
		})
	})

	describe('.create()', () => {
		it(`should create http server that can respond and close`, done => {
			const server = Server()
			expect(server).to.be.an('object')

			portfinder.getPortPromise()
			.then(port => {
				const serverConfig = {
					protocol: 'http',
					port,
					host: 'localhost',
					handler: (req, res) => {
						res.end(req.url)
					}
				}

				const httpServer = server.create(serverConfig)
				expect(httpServer).to.be.an('object')
				expect(server.instance).to.not.equal(null)

				expect(server.config).to.be.an('object')
				expect(server.config.protocol).to.equal('http')
				expect(server.config.port).to.equal(port)
				expect(server.config.host).to.equal('localhost')
				expect(server.config.handler).to.be.a('function')

				const options = {
					method: 'GET',
					protocol: 'http:',
					hostname: 'localhost',
					port,
					path: '/test/path'
				}

				const req = http.request(options, res => {
					let body = ''

					res.setEncoding('utf8')

					res.on('data', chunk => {
						body += chunk
					})

					const closeServer = () => {
						expect(server.instance).to.equal(null)
						done()
					}

					res.on('end', () => {
						body = body.toString()
						expect(body).to.equal('/test/path')

						server.close(closeServer)
					})
				})

				req.on('error', err => {
					console.log(`problem with request: ${err.message}`)
				})

				req.end()
			})
			.catch(err => {
				throw err.message
			})
		})
	})
})
