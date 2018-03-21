const http = require('http')
const getPort = require('get-port')

const ServerConstructor = config => {
	const {log} = config

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

	Server.close = () => new Promise(resolve => {
		Server.instance.close(() => {
			Server.instance = null
			resolve()
		})
	})

	Server.create = serverConfig => new Promise((resolve, reject) => {
		Server.configure(serverConfig)

		const {protocol, host, port, handler} = serverConfig

		Server.instance = protocols[protocol].createServer(handler)

		Server.instance.on('error', err => {
			log.error('error', err)
			reject(err)
		})

		getPort({port: port || false}).then(port => {
			Server.instance.listen(port, host)
			log.info(`Server started: ${protocol}://${host}:${port}`)
			resolve(Server)
		})
	})

	return Server
}

module.exports = ServerConstructor
