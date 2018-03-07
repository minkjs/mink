const path = require('path')

const Log = require('app/lib/core/log')

const MinkconfRoot = path.resolve(path.join(__dirname, '../'))

module.exports = () => {
	const cli = {
		flags: {
			logLevel: 'TRACE',
			logColor: true,
			systemUnderTest: true
		}
	}

	const log = Log(cli)
	const config = {
		MinkconfRoot,
		log
	}

	return config
}
