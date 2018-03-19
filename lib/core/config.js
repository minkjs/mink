const path = require('path')

const meow = require('meow')

const log = require('./log')
const filesys = require('./filesys')

const help = `
	Usage
	  $ mink

	Options
	  --minkconf  Minkconf.js file to use
	  --dir  Directory to serve files from
	  --log-level  Set console log level [OFF, TRACE, DEBUG, INFO, WARN, ERROR, FATAL]
	  --log-level-file  Set file log level [OFF, TRACE, DEBUG, INFO, WARN, ERROR, FATAL]

	Examples
	  $ mink --minkconf ~/Desktop/Minkconf.js
	  $ mink --log-level TRACE
	  $ mink --log-level-file WARN
`

const flags = require(path.join(__dirname, 'defaults.flags.js'))

const minkConfigFile = '.minkconf.js'

/**
 * Config - service configuration "properties"
 * @constructor
 * @param {object} argv - CLI flags
 */

const getMinkconfRoot = cli => {
	const cwd = process.cwd()

	if (cli.flags.dir) {
		const minkconfJs = filesys.findFileUp(cli.flags.dir, minkConfigFile)

		if (minkconfJs) {
			return path.dirname(minkconfJs)
		}

		if (filesys.dirExistsSync(cli.flags.dir)) {
			return cli.flags.dir
		}

		return cwd
	}

	const minkconfJs = filesys.findFileUp(cwd, minkConfigFile)

	if (typeof minkconfJs === 'string') {
		return path.dirname(minkconfJs)
	}

	return cwd
}

const getMinkconfFile = uri => {
	const minkconfFilePath = path.join(uri, minkConfigFile)
	const minkconfJs = filesys.fileExistsSync(minkconfFilePath)

	if (minkconfJs) {
		return minkconfFilePath
	}

	// There will always be a Minkconf.js file in the root of the Minkserv package
	const dirRelativeToThisFile = path.dirname(__filename)
	const defaultMinkconfFile = filesys.findFileUp(dirRelativeToThisFile, minkConfigFile)

	return defaultMinkconfFile
}

const loadMinkconfJsFile = uri => {
	const MinkconfJSData = require(uri)
	return MinkconfJSData
}

const Config = {
	getMinkconfRoot,
	getMinkconfFile,
	loadMinkconfJsFile
}

Config.init = argv => {
	const cli = meow({argv, help, flags})

	Config.flags = cli

	Config.MinkconfRoot = getMinkconfRoot(cli)
	Config.MinkconfFile = getMinkconfFile(Config.MinkconfRoot)
	Config.Minkconf = loadMinkconfJsFile(Config.MinkconfFile)
	Config.MinkconfData = Config.Minkconf.data

	Config.log = log(cli)

	return Config
}

module.exports = Config

