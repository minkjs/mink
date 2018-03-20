import path from 'path'
import test from 'ava'

import configMockGen from '../../mock/config.log'
import _requests from './requests'

const configMock = configMockGen()

test('_requestsConstructor(): should instantiate', t => {
	const requests = _requests(configMock)
	t.is(typeof requests, 'object')
})

test('.resourceExists(): should find existent file', async t => {
	const requests = _requests(configMock)
	const uri = __filename
	const result = await requests.resourceExists(uri)
	t.is(typeof result, 'string')
	t.is(result, 'file')
})

test('.resourceExists(): should find existent dir', async t => {
	const requests = _requests(configMock)
	const uri = __dirname
	const result = await requests.resourceExists(uri)
	t.is(typeof result, 'string')
	t.is(result, 'dir')
})

test('.resourceExists(): should NOT find non-existent file', async t => {
	const requests = _requests(configMock)
	const uri = path.join(__dirname, 'foobar.baz')
	const result = await requests.resourceExists(uri)
	t.is(typeof result, 'boolean')
	t.is(result, false)
})

// Perhaps redudant: same codepath as searching for the file
// unless the directory state encounters a fs read error.
test('.resourceExists(): should NOT find non-existent dir', async t => {
	const requests = _requests(configMock)
	const uri = path.join(__dirname, 'foo/bar/baz/')
	const result = await requests.resourceExists(uri)
	t.is(typeof result, 'boolean')
	t.is(result, false)
})

test('.handlUri(): should handle plugins returning html payloads', async t => {
	const requests = _requests(configMock)

	const mockPayload = {
		code: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		body: '<div><h1>Test</h1></div>'
	}

	const mockPluginHandler = {
		plugin: {
			handler: {
				callback: () => new Promise(resolve => {
					resolve(mockPayload)
				})
			}
		}
	}

	const props = {
		handlerModule: mockPluginHandler,
		uri: '',
		res: {}
	}

	const result = await requests.handleUri(props)
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
	const requests = _requests(configMock)

	const mockPluginHandler = {
		plugin: {
			handler: {
				callback: () => new Promise(resolve => {
					resolve(null)
				})
			}
		}
	}

	const props = {
		handlerModule: mockPluginHandler
	}

	const result = await requests.handleUri(props)
	t.is(result, null)
})

test('.handlUri(): should handle plugins with handlebars templates', async t => {
	const requests = _requests(configMock)

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
		plugin: {
			handler: {
				callback: () => new Promise(resolve => {
					resolve(mockPayload)
				})
			}
		},
		template: '<article>{{{content}}}</article>'
	}

	const props = {
		handlerModule: mockPluginHandler,
		uri: '',
		res: {}
	}

	const result = await requests.handleUri(props)
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
	const requests = _requests(configMock)

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
				plugin: {
					handler: {
						callback: () => new Promise(resolve => {
							resolve(mockPayload)
						})
					}
				},
				template: '<article>{{{content}}}</article>'
			}
		}
	}

	const requests = _requests(configMock, routesMock)

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
	const requests = _requests(configMock)

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

	const requests = _requests(configMock, routesMock)

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

test.cb('.sanitize(): should sanitize trailing separators', t => {
	// Leave the trailing separator off the url '/'
	// It will be added back internally by the request handler
	// This allows the pattern to be matched in the
	const uri = '/mock'

	const plugin = {
		handler: {
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

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/',
				plugin
			}
		}
	}

	const requests = _requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	requests.requestHandler(req, res)
})

test.cb('handler(file.contents)', t => {
	const uri = '/mock/foobar.txt'

	const plugin = {
		handler: {
			callback: file => {
				t.is(typeof file, 'object')
				t.is(typeof file.contents, 'object')
				const plainText = String(file.contents)
				t.is(typeof plainText, 'string')
				t.is(plainText, 'Bazqux!')
				t.end()
			}
		}
	}

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/*.txt',
				plugin
			}
		}
	}

	const requests = _requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	requests.requestHandler(req, res)
})

test.cb('handler(file) is parsed path', t => {
	const uri = '/mock/foobar.txt'

	const plugin = {
		handler: {
			callback: file => {
				t.is(typeof file, 'object')
				t.is(typeof file.contents, 'object')
				t.is(typeof file.root, 'string')
				t.is(typeof file.dir, 'string')
				t.is(typeof file.base, 'string')
				t.is(typeof file.ext, 'string')
				t.is(typeof file.name, 'string')
				t.end()
			}
		}
	}

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/*.txt',
				plugin
			}
		}
	}

	const requests = _requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	requests.requestHandler(req, res)
})

test.cb('handler(uri)', t => {
	const uri = '/mock/foobar.txt'

	const plugin = {
		handler: {
			callback: uri => {
				t.is(typeof uri, 'string')
				t.true(uri.includes('/mock/foobar.txt'))
				t.end()
			}
		}
	}

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/*.txt',
				plugin
			}
		}
	}

	const requests = _requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	requests.requestHandler(req, res)
})

test.cb('handler(log)', t => {
	const uri = '/mock/'

	const plugin = {
		handler: {
			callback: log => {
				t.is(typeof log, 'object')
				t.true(Reflect.has(log, 'trace'))
				t.true(Reflect.has(log, 'debug'))
				t.true(Reflect.has(log, 'info'))
				t.true(Reflect.has(log, 'warn'))
				t.true(Reflect.has(log, 'error'))
				t.true(Reflect.has(log, 'fatal'))
				t.end()
			}
		}
	}

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/',
				plugin
			}
		}
	}

	const requests = _requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	requests.requestHandler(req, res)
})

test.cb('handler(root)', t => {
	const uri = '/mock/'

	const plugin = {
		handler: {
			callback: root => {
				t.is(typeof root, 'string')
				t.true(__dirname.includes(root))
				t.end()
			}
		}
	}

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/',
				plugin
			}
		}
	}

	const requests = _requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	requests.requestHandler(req, res)
})

test.cb('handler(template)', t => {
	const uri = '/mock/'

	const plugin = {
		handler: {
			callback: template => {
				t.is(typeof template, 'string')
				t.is(template, 'foobar')
				t.end()
			}
		}
	}

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/',
				plugin,
				template: 'foobar'
			}
		}
	}

	const requests = _requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	requests.requestHandler(req, res)
})

test.cb('handler(res)', t => {
	const uri = '/mock/'

	const plugin = {
		handler: {
			callback: res => {
				t.is(typeof res, 'object')
				t.is(typeof res.end, 'function')
				t.end()
			}
		}
	}

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/',
				plugin
			}
		}
	}

	const requests = _requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	requests.requestHandler(req, res)
})

test.cb('handler(req)', t => {
	const uri = '/mock/'

	const plugin = {
		handler: {
			callback: req => {
				t.is(typeof req, 'object')
				t.true(Reflect.has(req, 'url'))
				t.is(req.url, uri)
				t.end()
			}
		}
	}

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/',
				plugin
			}
		}
	}

	const requests = _requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	requests.requestHandler(req, res)
})

test.cb('handler(next)', t => {
	const uri = '/mock/'

	const plugin = {
		handler: {
			callback: next => {
				t.is(typeof next, 'object')
				t.end()
			}
		}
	}

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/',
				plugin
			}
		}
	}

	const requests = _requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	const next = {}

	requests.requestHandler(req, res, next)
})

test.cb('handler(data)', t => {
	const uri = '/mock/'

	const plugin = {
		handler: {
			callback: data => {
				t.is(typeof data, 'object')
				t.true(Reflect.has(data, 'foo'))
				t.is(typeof data.foo, 'string')
				t.is(data.foo, 'bar')
				t.end()
			}
		}
	}

	const routesMock = {
		handlers: {
			dirPlugin: {
				pattern: '**/',
				plugin
			}
		}
	}

	const requests = _requests(configMock, routesMock)

	const req = {
		url: uri
	}

	const res = {
		writeHead: () => {},
		end: () => {}
	}

	const next = {}

	requests.requestHandler(req, res, next)
})
