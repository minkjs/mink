const Config = require('app/lib/core/config')
const Server = require('app/lib/http/server')
const requests = require('app/lib/http/requests')
const routes = require('app/lib/core/routes')
const Log = require('app/lib/core/log')

module.exports = args => {
	const Service = {}

	Service.log = Log.initialize()

	Service.config = Config.init(args)
	routes.init(Service.config)

	const server = Server(Service.config)

	const serverConfig = {
		protocol: 'http',
		port: 8001,
		host: 'localhost',
		handler: requests.requestHandler
	}

	Service.httpServer = server.create(serverConfig)

	return Service
}
