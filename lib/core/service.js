const Config = require('app/lib/core/config')
const Server = require('app/lib/http/server')
const Requests = require('app/lib/http/requests')
const Routes = require('app/lib/core/routes')
const Log = require('app/lib/core/log')
const Filter = require('app/lib/http/filter')

module.exports = argv => {
	const Service = {}

	Service.log = Log.initialize(argv)

	Service.config = Config(argv)

	const routes = Routes(Service.config)

	const filter = Filter(Service.config)

	const requests = Requests(Service.config, routes.handlers, filter)

	const server = Server(Service.config)

	const serverConfig = {
		protocol: 'http',
		port: 8001,
		host: 'localhost',
		handler: requests.handler
	}

	Service.httpServer = server.create(serverConfig)

	return Service
}
