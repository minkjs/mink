import http from 'http'
import portfinder from 'portfinder'
import Server from 'app/lib/http/server'
import ConfigMock from 'app/mock/config.log'

import test from 'ava'

const configMock = ConfigMock()

test('.configure(): should start with null configuration', t => {
	const server = Server(configMock)
	t.is(typeof server, 'object')
	t.is(typeof server.config, 'object')
	t.is(server.config.protocol, null)
	t.is(server.config.port, null)
	t.is(server.config.host, null)
	t.is(server.config.handler, null)
})

test('.configure(): should store configuration', t => {
	const server = Server(configMock)
	t.is(typeof server, 'object')

	portfinder.getPortPromise().then(port => {
		const serverConfig = {
			protocol: 'http',
			port,
			host: 'localhost',
			handler: () => {}
		}

		server.configure(serverConfig)

		t.is(typeof server.config, 'object')
		t.is(server.config.protocol, 'http')
		t.is(typeof server.config.port, 'number')
		t.is(server.config.port, port)
		t.is(server.config.host, 'localhost')
		t.is(typeof server.config.handler, 'function')
	})
})

test.cb('.create() :should create http server that can respond and close', t => {
	const server = Server(configMock)
	t.is(typeof server, 'object')

	portfinder.getPortPromise().then(port => {
		const serverConfig = {
			protocol: 'http',
			port,
			host: 'localhost',
			handler: (req, res) => {
				res.end(req.url)
			}
		}

		const httpServer = server.create(serverConfig)
		t.is(typeof httpServer, 'object')
		t.not(server.instance, null)

		t.is(typeof server.config, 'object')
		t.is(server.config.protocol, 'http')
		t.is(server.config.port, port)
		t.is(server.config.host, 'localhost')
		t.is(typeof server.config.handler, 'function')

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
				t.is(server.instance, null)
				t.end()
			}

			res.on('end', () => {
				body = body.toString()
				t.is(body, '/test/path')

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
