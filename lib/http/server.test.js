import http from 'http'
import getPort from 'get-port'
import test from 'ava'

import configMockGen from '../../test/mock/config.log'
import _server from './server'

const configMock = configMockGen()

test('.configure(): should start with null configuration', t => {
	const server = _server(configMock)
	t.is(typeof server, 'object')
	t.is(typeof server.config, 'object')
	t.is(server.config.protocol, null)
	t.is(server.config.port, null)
	t.is(server.config.host, null)
	t.is(server.config.handler, null)
})

test('.configure(): should store configuration', t => {
	const server = _server(configMock)
	t.is(typeof server, 'object')

	getPort().then(port => {
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
	const server = _server(configMock)
	t.is(typeof server, 'object')

	getPort().then(port => {
		const serverConfig = {
			protocol: 'http',
			port,
			host: 'localhost',
			handler: (req, res) => {
				res.end(req.url)
			}
		}

		server.create(serverConfig).then(liveServer => {
			t.is(typeof liveServer, 'object')
			t.not(liveServer.instance, null)

			t.is(typeof liveServer.config, 'object')
			t.is(liveServer.config.protocol, 'http')
			t.is(liveServer.config.port, port)
			t.is(liveServer.config.host, 'localhost')
			t.is(typeof liveServer.config.handler, 'function')

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

				// // eslint-disable-next-line camelcase
				// const close_server = () => {
				// 	t.is(server.instance, null)
				// 	t.end()
				// }

				res.on('end', () => {
					body = body.toString()
					t.is(body, '/test/path')

					server.close().then(t.end)
				})
			})

			req.on('error', err => {
				throw new Error(err)
			})

			req.end()
		})
	})
	.catch(err => {
		throw err.message
	})
})
