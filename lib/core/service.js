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

	const serverConfig = {
		protocol: 'http',
		host: 'localhost',
		port: service.config.HttpPort,
		handler: service.requests.requestHandler
	}

	service.httpServer = service.server.create(serverConfig)
	.then(() => {
		resolve(service)
	}).catch(err => {
		reject(err)
	})
})
