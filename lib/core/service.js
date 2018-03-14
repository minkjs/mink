const portfinder = require('portfinder')

const Config = require('app/lib/core/config')
const Server = require('app/lib/http/server')
const Requests = require('app/lib/http/requests')
const Routes = require('app/lib/core/routes')

module.exports = args => new Promise((resolve, reject) => {
	const Service = {}

	Service.config = Config.init(args)
	Service.routes = Routes(Service.config)
	Service.server = Server(Service.config)
	Service.requests = Requests(Service.config, Service.routes)

	portfinder.getPortPromise()
	.then(port => {
		const serverConfig = {
			protocol: 'http',
			port,
			host: 'localhost',
			handler: Service.requests.requestHandler
		}

		Service.httpServer = Service.server.create(serverConfig)
		resolve(Service)
	})
	.catch(err => {
		Service.config.log.error('HTTP Server failed to start', err)
		reject(err)
	})
})
