const path = require('path')
const micromatch = require('micromatch')
const Handlebars = require('handlebars')

const filesys = require('app/lib/core/filesys')

const paths = require('app/lib/http/paths')
const Filter = require('app/lib/http/filter')

const notFound = res => {
	res.writeHead(404, {
		'Content-Type': 'text/plain'
	})

	res.write('404 Not found')

	res.end()
}

const notImplemented = res => {
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

	const filter = Filter(config)

	const requests = {
		notFound,
		notImplemented,
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

	requests.writeRes = (payload, finalHtml, res) => {
		res.writeHead(payload.code, payload.headers)
		res.end(finalHtml)
	}

	requests.handleUri = (handler, fileUri, res, req) =>
	new Promise((resolve, reject) => {
		handler.callback(fileUri, req, res).then(payload => {
			// The plugin handles the response internally
			if (payload === null) {
				return resolve(null)
			}

			let htmlOutput

			// The plugin has a template into which data is rendered
			if (Reflect.has(handler, 'template')) {
				const template = Handlebars.compile(handler.template)
				htmlOutput = template(payload.data)

			// The plugin outputs direct HTML
			} else {
				htmlOutput = payload.body
			}

			// Check HTML result may contain further <!--mink--> includes
			filter.scan(htmlOutput).then(finalHtml => {
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

	requests.findMatchingModule = matchableUri => {
		let handler

		Reflect.ownKeys(routes.handlers).some(handlerName => {
			const {pattern, module} = routes.handlers[handlerName]

			// Pass over modules without a path
			if (!pattern) {
				return false
			}

			const match = micromatch.isMatch(matchableUri, pattern)

			if (match) {
				log.info(`Match route: ${pattern}, with module: ${module} found for: ${matchableUri}`)
				handler = routes.handlers[handlerName]
				return true
			}

			return false
		})

		return handler
	}

	requests.requestHandler = (req, res) => {
		const requestUri = req.url
		log.info(requestUri)

		const fileUri = paths.absolute(config.MinkconfRoot, requestUri)
		log.trace(fileUri)

		requests.resourceExists(fileUri).then(existsAsType => {
			if (!existsAsType) {
				log.info(`The resource does not exist: ${fileUri}`)
				notFound(res)
				return false
			}

			// Mink matches directories by using the "/" character
			// While the "foo/bar" dir may exist, Micromatch will not be able to
			// match it without the trailling slash.
			// Files are chosen above directories where both a directory and a
			// file exist with the same name, unless a trailing slash is added
			// to the require uri.
			let matchableUri = fileUri

			if (existsAsType === 'dir') {
				matchableUri = sanitizeTrailingSep(fileUri)
			}

			const handlerModule = requests.findMatchingModule(matchableUri)

			if (!handlerModule) {
				log.info(`No matching module found for: ${requestUri}`)
				notImplemented(res)
				return false
			}

			requests.handleUri(handlerModule, matchableUri, res, req)
			.then(handlerResult => {
				requests.writeRes(...handlerResult)
			})
		})
	}

	return requests
}

module.exports = RequestsConstructor
