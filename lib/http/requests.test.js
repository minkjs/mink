import path from 'path'
import Requests from 'app/lib/http/requests'
import ConfigMock from 'app/mock/config.log'

import test from 'ava'

const configMock = ConfigMock()

test('RequestsConstructor(): should instantiate', t => {
	const requests = Requests(configMock)
	t.is(typeof requests, 'object')
})

test('.resourceExists(): should find existent file', async t => {
	const requests = Requests(configMock)
	const uri = __filename
	const result = await requests.resourceExists(uri)
	t.is(typeof result, 'string')
	t.is(result, 'file')
})

test('.resourceExists(): should find existent dir', async t => {
	const requests = Requests(configMock)
	const uri = __dirname
	const result = await requests.resourceExists(uri)
	t.is(typeof result, 'string')
	t.is(result, 'dir')
})

test('.resourceExists(): should NOT find non-existent file', async t => {
	const requests = Requests(configMock)
	const uri = path.join(__dirname, 'foobar.baz')
	const result = await requests.resourceExists(uri)
	t.is(typeof result, 'boolean')
	t.is(result, false)
})

// Perhaps redudant: same codepath as searching for the file
// unless the directory state encounters a fs read error.
test('.resourceExists(): should NOT find non-existent dir', async t => {
	const requests = Requests(configMock)
	const uri = path.join(__dirname, 'foo/bar/baz/')
	const result = await requests.resourceExists(uri)
	t.is(typeof result, 'boolean')
	t.is(result, false)
})

test('.handlUri(): should handle plugins returning html payloads', async t => {
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

	const result = await requests.handleUri(mockPluginHandler, uri, mockRes)
	t.is(typeof result, 'object')
	t.is(typeof result.payload.code, 'number')
	t.is(result.payload.code, 200)
	t.is(typeof result.payload.headers, 'object')
	t.is(typeof result.payload.headers['Content-Type'], 'string')
	t.is(result.payload.headers['Content-Type'], 'text/html')
	t.is(typeof result.payload.body, 'string')
	t.is(result.payload.body, mockPayload.body)
	t.is(typeof result.finalHtml, 'string')
	t.is(result.finalHtml, mockPayload.body)
	t.is(typeof result.res, 'object')
})

test('.handlUri(): should handle plugins with internal res writes', async t => {
	const requests = Requests(configMock)

	const mockPluginHandler = {
		callback: () => new Promise(resolve => {
			resolve(null)
		})
	}

	const result = await requests.handleUri(mockPluginHandler)
	t.is(result, null)
})

test('.handlUri(): should handle plugins with handlebars templates', async t => {
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

	const result = await requests.handleUri(mockPluginHandler, uri, mockRes)
	t.is(typeof result, 'object')
	t.is(typeof result.payload.code, 'number')
	t.is(result.payload.code, 200)
	t.is(typeof result.payload.headers, 'object')
	t.is(typeof result.payload.headers['Content-Type'], 'string')
	t.is(result.payload.headers['Content-Type'], 'text/html')
	t.is(typeof result.payload.data, 'object')
	t.is(typeof result.payload.data.content, 'string')
	t.is(result.payload.data.content, '<p>This is content</p>')
	t.is(typeof result.finalHtml, 'string')
	t.is(result.finalHtml, '<article><p>This is content</p></article>')
	t.is(typeof result.res, 'object')
})

test('.findMatchingModule(): should find a module', t => {
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

	t.is(typeof matchingModule, 'object')
	t.is(typeof matchingModule.module, 'object')
	t.is(typeof matchingModule.module.foo, 'string')
	t.is(matchingModule.module.foo, 'bar')
})

test.cb('.requestHandler(): should handle uri request with module response', t => {
	const mockPayload = {
		code: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		data: {
			content: '<p>This is content</p>'
		}
	}

	const routesMock = {
		handlers: {
			htmlPlugin: {
				pattern: '**/*.html',
				callback: () => new Promise(resolve => {
					resolve(mockPayload)
				}),
				template: '<article>{{{content}}}</article>'
			}
		}
	}

	const requests = Requests(configMock, routesMock)

	const uri = '/mock/content.html'

	const req = {
		url: uri
	}

	// WARNING: When errors in the chai expect syntax will
	// fail silently inside this codepath. The test will
	// timeout rather than pass back an error.
	const res = {
		writeHead: (code, headers) => {
			t.is(typeof code, 'number')
			t.is(code, 200)
			t.is(typeof headers, 'object')
			t.is(typeof headers['Content-Type'], 'string')
			t.is(headers['Content-Type'], 'text/html')
		},
		end: body => {
			t.is(typeof body, 'string')
			t.is(body, '<article><p>This is content</p></article>')
			t.end()
		}
	}

	requests.requestHandler(req, res)
})

test.cb('.notFound404:() should be called when file not found', t => {
	const requests = Requests(configMock)

	const uri = '/mock/non-existent-content.html'

	const req = {
		url: uri
	}

	// WARNING: When errors in the chai expect syntax will
	// fail silently inside this codepath. The test will
	// timeout rather than pass back an error.
	const res = {
		writeHead: (code, headers) => {
			t.is(typeof code, 'number')
			t.is(code, 404)
			t.is(typeof headers['Content-Type'], 'string')
			t.is(headers['Content-Type'], 'text/plain')
		},
		write: body => {
			t.is(typeof body, 'string')
			t.is(body, '404 Not found')
		},
		end: () => {
			t.end()
		}
	}

	requests.requestHandler(req, res)
})

test.cb('.notImplemented501(): should be called when not handler available for pattern', t => {
	// Note: there will never be a 501 Not implemented when
	// using the file plugin to pass back binary content

	const routesMock = {
		handlers: {
		}
	}

	const requests = Requests(configMock, routesMock)

	const uri = '/mock/content.html'

	const req = {
		url: uri
	}

	// WARNING: When errors in the chai expect syntax will
	// fail silently inside this codepath. The test will
	// timeout rather than pass back an error.
	const res = {
		writeHead: (code, headers) => {
			t.is(typeof code, 'number')
			t.is(code, 501)
			t.is(typeof headers, 'object')
			t.is(typeof headers['Content-Type'], 'string')
			t.is(headers['Content-Type'], 'text/plain')
		},
		write: body => {
			t.is(typeof body, 'string')
			t.is(body, '501 Not implemented')
		},
		end: () => {
			t.end()
		}
	}

	requests.requestHandler(req, res)
})

test.cb('.sanitize(): should sanitize trailing separattors', t => {
	// Leave the trailing separator off the url '/'
	// It will be added back internally by the request handler
	// This allows the pattern to be matched in the
	const uri = '/mock'

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/',
				callback: uri => {
					t.is(typeof uri, 'string')

					const lastChar = uri[uri.length - 1]
					t.is(typeof lastChar, 'string')
					t.is(lastChar, path.sep)

					const dirs = uri.split(path.sep)
					const deepestDir = dirs[dirs.length - 2]
					t.is(typeof deepestDir, 'string')
					t.is(deepestDir, 'mock')

					t.end()
				}
			}
		}
	}

	const requests = Requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	requests.requestHandler(req, res)
})
