const portfinder = require('portfinder')

const requests = require('../http/requests')
const server = require('../http/server')
const config = require('./config')
const routes = require('./routes')

module.exports = args => new Promise((resolve, reject) => {
	const service = {}

	service.config = config.init(args)
	service.routes = routes(service.config)
	service.server = server(service.config)
	service.requests = requests(service.config, service.routes)

	portfinder.getPortPromise()
	.then(port => {
		const serverConfig = {
			protocol: 'http',
			port,
			host: 'localhost',
			handler: service.requests.requestHandler
		}

		service.httpServer = service.server.create(serverConfig)
		resolve(service)
	})
	.catch(err => {
		service.config.log.error('HTTP Server failed to start', err)
		reject(err)
	})
})
