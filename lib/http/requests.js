const path = require('path')
const micromatch = require('micromatch')
const Handlebars = require('handlebars')

const Paths = require('app/lib/http/paths')
const log = require('app/lib/core/log')

const requestsInit = (config, handlers, filter) => {
	const paths = Paths(config)

	const Requests = {a: 1}

	const resourceExists = uri => new Promise((resolve, reject) => {
		Promise.all([
			paths.directoryExists(uri),
			paths.fileExists(uri)
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
			console.log(err)
			reject(err)
		})
	})

	const handle = (handler, fileUri, res, req) => {
		handler.callback(fileUri, req, res)
		.then(payload => {
			// The plugin handles the response internally
			if (payload === null) {
				return
			}

			let htmlOutput

			// The plugin has a template
			if (Reflect.has(handler, 'template')) {
				const template = Handlebars.compile(handler.template)
				htmlOutput = template(payload.body)

			// The plugin outputs direct HTML
			} else {
				htmlOutput = payload.body
			}

			// Check HTML result may contain further <!--mink--> includes
			filter.scan(htmlOutput).then(finalHtml => {
				res.writeHead(payload.code, payload.headers)
				res.end(finalHtml)
			}).catch(err => {
				console.error(err)
			})
		})
		.catch(err => {
			console.error(err)
		})
	}

	const findMatchingModule = matchableUri => {
		let handler

		Reflect.ownKeys(handlers).some(handlerName => {
			const {pattern, module} = handlers[handlerName]

			// Pass over modules without a path
			if (!pattern) {
				return false
			}

			const match = micromatch.isMatch(matchableUri, pattern)

			if (match) {
				log.info(`Match route: ${pattern}, with module: ${module} found for: ${matchableUri}`)
				handler = handlers[handlerName]
				return true
			}

			return false
		})

		return handler
	}

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

	Requests.handler = (req, res) => {
		const requestUri = req.url
		log.info(requestUri)

		const fileUri = paths.absolute(requestUri)
		log.info(fileUri)

		resourceExists(fileUri).then(existsAsType => {
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

			const handler = findMatchingModule(matchableUri)

			if (!handler) {
				log.info(`No matching module found for: ${requestUri}`)
				notImplemented(res)
				return false
			}

			handle(handler, matchableUri, res, req)
		})
	}

	return Requests
}

module.exports = requestsInit
