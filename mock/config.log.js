const Log = require('app/lib/core/log')

const cli = {
	flags: {
		logLevel: 'TRACE',
		logColor: true,
		systemUnderTest: true
	}
}

const log = Log(cli)
const config = {log}

module.exports = config
