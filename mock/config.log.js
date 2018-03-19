const path = require('path')

const log = require('../lib/core/log')

const MinkconfRoot = path.resolve(path.join(__dirname, '../'))

module.exports = () => {
	const cli = {
		flags: {
			logLevel: 'TRACE',
			logColor: true,
			systemUnderTest: true
		}
	}

	const config = {
		MinkconfRoot,
		log: log(cli)
	}

	return config
}
