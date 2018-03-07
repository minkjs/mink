const Config = require('app/lib/core/config')
const Server = require('app/lib/http/server')
const Requests = require('app/lib/http/requests')
const Routes = require('app/lib/core/routes')

module.exports = args => {
	const Service = {}

	Service.config = Config.init(args)
	Service.routes = Routes(Service.config)
	Service.server = Server(Service.config)
	Service.requests = Requests(Service.config, Service.routes)

	const serverConfig = {
		protocol: 'http',
		port: 8001,
		host: 'localhost',
		handler: Service.requests.requestHandler
	}

	Service.httpServer = Service.server.create(serverConfig)

	return Service
}
