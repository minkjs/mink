const path = require('path')
const fs = require('fs')
const micromatch = require('micromatch')
const Handlebars = require('handlebars')
const magicParams = require('magic-params')

const filesys = require('../core/filesys')
const paths = require('./paths')
const filter = require('./filter')

const notFound404 = res => {
	res.writeHead(404, {
		'Content-Type': 'text/plain'
	})

	res.write('404 Not found')

	res.end()
}

const notImplemented501 = res => {
	res.writeHead(501, {
		'Content-Type': 'text/plain'
	})

	res.write('501 Not implemented')

	res.end()
}

const sanitizeTrailingSep = uri => {
	let sanitized = uri

	if (uri.lastIndexOf(path.sep) !== uri.length - 1) {
		sanitized += path.sep
	}

	return sanitized
}

const RequestsConstructor = (config, routes) => {
	const {log} = config

	const htmlFilter = filter(config)

	const requests = {
		notFound404,
		notImplemented501,
		sanitizeTrailingSep
	}

	requests.resourceExists = uri => new Promise((resolve, reject) => {
		Promise.all([
			filesys.directoryExists(uri),
			filesys.fileExists(uri)
		]).then(results => {
			const [isDir, isFile] = results

			if (isFile) {
				return resolve('file')
			}

			if (isDir) {
				return resolve('dir')
			}

			resolve(false)
		}).catch(err => {
			log.error(err)
			reject(err)
		})
	})

	requests.handleUri = props => new Promise((resolve, reject) => {
		const {
			handlerModule,
			uri,
			res,
			req,
			next
		} = props

		const paramsDef = {
			log: config.log,
			uri,
			root: config.MinkconfRoot,
			template: handlerModule.template,
			res,
			req,
			next,
			data: config.MinkconfData,
			settings: handlerModule.settings
		}

		const plugin = handlerModule.plugin
		const handlerFn = plugin.handler.callback
		const handlerParamList = magicParams.list(handlerFn)

		// Pass params on $mink to allow destructuring in handler
		if (handlerParamList.includes('mink')) {
			paramsDef.mink = Object.assign({}, paramsDef)
		}

		if (handlerParamList.includes('file')) {
			paramsDef.file = Object.assign({}, {
				contents: fs.readFileSync(uri),
				path: uri
			}, path.parse(uri))
		}

		const handlerActiveCb = magicParams.apply(paramsDef, handlerFn, plugin)

		let thenable = false
		if (typeof handlerActiveCb === 'object') {
			thenable = Reflect.has(handlerActiveCb, 'then')
		}

		if (thenable === false) {
			try {
				const result = magicParams.apply(paramsDef, handlerFn, plugin)
				return resolve(result)
			} catch (err) {
				log.error(err)
				return reject(err)
			}
		}

		handlerActiveCb.then(payload => {
			// The plugin handles the response internally
			if (payload === null) {
				return resolve(null)
			}

			let htmlOutput

			// The plugin has a template into which data is rendered
			if (Reflect.has(handlerModule, 'template') && typeof handlerModule.template === 'string') {
				const template = Handlebars.compile(handlerModule.template)
				htmlOutput = template(payload.data)

			// The plugin outputs direct HTML
			} else {
				htmlOutput = payload.body
			}

			// Check HTML result may contain further <!--mink--> includes
			htmlFilter.scan(htmlOutput).then(finalHtml => {
				const result = {
					payload,
					finalHtml,
					res
				}

				resolve(result)
			}).catch(err => {
				log.error(err)
				reject(err)
			})
		})
		.catch(err => {
			log.error(err)
			reject(err)
		})
	})

	requests.findMatchingModule = (matchableUri, routes) => {
		let handler

		Reflect.ownKeys(routes.handlers).some(handlerName => {
			const {pattern} = routes.handlers[handlerName]

			// Pass over modules without a path
			if (!pattern) {
				return false
			}

			const match = micromatch.isMatch(matchableUri, pattern)

			if (match) {
				log.info(`Matched pattern ${pattern} to plugin ${handlerName} for ${matchableUri}`)
				handler = routes.handlers[handlerName]
				return true
			}

			return false
		})

		return handler
	}

	requests.writeRes = (payload, html, res) => {
		res.writeHead(payload.code, payload.headers)
		res.end(html || payload.body)
		return res
	}

	requests.requestHandler = (req, res, next) => {
		const requestUri = req.url
		log.info(requestUri)

		const fileUri = paths.absolute(config.MinkconfRoot, requestUri)

		requests.resourceExists(fileUri).then(typeofResource => {
			if (!typeofResource) {
				log.info(`The resource does not exist: ${fileUri}`)
				notFound404(res)
				return false
			}

			// Mink matches directories by using the "/" character
			// While the "foo/bar" dir may exist, Micromatch will not be able to
			// match it without the trailling slash.
			// Files are chosen above directories where both a directory and a
			// file exist with the same name, unless a trailing slash is added
			// to the require uri.
			let matchableUri = fileUri

			if (typeofResource === 'dir') {
				matchableUri = sanitizeTrailingSep(fileUri)
			}

			const handlerModule = requests.findMatchingModule(matchableUri, routes)

			if (!handlerModule) {
				log.info(`No matching module found for: ${requestUri}`)
				notImplemented501(res)
				return false
			}

			const props = {
				handlerModule,
				uri: matchableUri,
				res,
				req,
				next
			}

			return requests.handleUri(props).then(result => {
				if (result && Reflect.has(result, 'payload')) {
					const html = result.finalHtml || result.payload.html
					return requests.writeRes(result.payload, html, result.res)
				}
			})
			.catch(err => {
				log.error(err)
				return err
			})
		})
	}

	return requests
}

module.exports = RequestsConstructor
