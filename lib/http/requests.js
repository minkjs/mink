const path = require('path')
const micromatch = require('micromatch')
const Handlebars = require('handlebars')

const Paths = require('app/lib/http/paths')
const log = require('app/lib/core/log')
const filter = require('app/lib/http/filter')

const requestsInit = (config, handlers) => {
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
		console.log(filter)
		handler.callback(fileUri, req, res)
		.then(payload => {
			console.dir(payload)
			res.writeHead(payload.code, payload.headers)

			const template = Handlebars.compile(handler.template)
			const result = template(payload.body)

			res.end(result)
		})
	}

	const matchingModule = fileUri => {
		let handler

		Reflect.ownKeys(handlers).some(handlerName => {
			const {pattern, module} = handlers[handlerName]

			// Pass over modules without a path
			if (!pattern) {
				return false
			}

			const match = micromatch.isMatch(fileUri, pattern)

			console.log(pattern, match)

			if (match) {
				log.trace(`Match route: ${pattern}, with module: ${module} found for: ${fileUri}`)
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
		if (uri.substr(uri.length - 1 !== path.sep, 1)) {
			uri += path.sep
		}

		console.log(uri)
		return uri
	}

	Requests.handler = (req, res) => {
		const requestUri = req.url
		log.info(requestUri)

		const fileUri = paths.absolute(requestUri)
		log.info(fileUri)

		resourceExists(fileUri).then(existsAsType => {
			console.log('exists:', existsAsType)

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

			const handler = matchingModule(matchableUri)

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
