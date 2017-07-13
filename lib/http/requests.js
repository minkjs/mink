const Paths = require('app/lib/http/paths')

const micromatch = require('micromatch')
const Handlebars = require('handlebars')

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
			const exists = (isDir || isFile) === true
			resolve(exists)
		}).catch(err => {
			console.log(err)
			reject(err)
		})
	})

	const handle = (handler, fileUri, res, req) => {
		console.log(filter)
		handler.callback(fileUri, req, res)
		.then(payload => {
			console.log(payload)
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

			const match = micromatch.isMatch(fileUri, pattern)

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

	Requests.handler = (req, res) => {
		const requestUri = req.url
		log.info(requestUri)

		const fileUri = paths.absolute(requestUri)
		log.info(fileUri)

		resourceExists(fileUri).then(exists => {
			console.log('exists:', exists)

			if (!exists) {
				log.info(`The resource does not exist: ${fileUri}`)
				notFound(res)
				return false
			}

			const handler = matchingModule(fileUri)

			if (!handler) {
				log.info(`No matching module found for: ${requestUri}`)
				notImplemented(res)
				return false
			}

			handle(handler, fileUri, res, req)
		})
	}

	return Requests
}

module.exports = requestsInit
