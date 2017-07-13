const http = require('http')
const log = require('app/lib/core/log')

module.exports = () => {
	const Server = {}

	Server.instance = null

	Server.config = {
		protocol: null,
		port: null,
		host: null,
		handler: null
	}

	Server.configure = serverConfig => {
		Server.config.protocol = serverConfig.protocol
		Server.config.port = serverConfig.port
		Server.config.host = serverConfig.host
		Server.config.handler = serverConfig.handler
	}

	const protocols = {
		http
	}

	Server.close = callback => {
		return Server.instance.close(() => {
			Server.instance = null

			if (callback) {
				return callback()
			}
		})
	}

	Server.create = serverConfig => {
		Server.configure(serverConfig)

		const {protocol, port, host, handler} = serverConfig

		Server.instance = protocols[protocol].createServer(handler)
		Server.instance.listen(port, host)

		log.info(`Server started: ${protocol}://${host}:${port}`)

		return Server.instance
	}

	return Server
}
