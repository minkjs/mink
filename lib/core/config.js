const path = require('path')

const meow = require('meow')

const Log = require('app/lib/core/log')
const filesys = require('app/lib/core/filesys')

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

/**
 * Config - service configuration "properties"
 * @constructor
 * @param {object} argv - CLI flags
 */

const getMinkconfRoot = cli => {
	const cwd = process.cwd()

	if (cli.flags.dir) {
		const MinkconfJs = filesys.findFileUp(cli.flags.dir, 'Minkconf.js')

		if (MinkconfJs) {
			return path.dirname(MinkconfJs)
		}

		if (filesys.dirExistsSync(cli.flags.dir)) {
			return cli.flags.dir
		}

		return cwd
	}

	const MinkconfJs = filesys.findFileUp(cwd, 'Minkconf.js')

	if (typeof MinkconfJs === 'string') {
		return path.dirname(MinkconfJs)
	}

	return cwd
}

const getMinkconfFile = uri => {
	const MinkconfFilePath = path.join(uri, 'Minkconf.js')
	const MinkconfJs = filesys.fileExistsSync(MinkconfFilePath)

	if (MinkconfJs) {
		return MinkconfFilePath
	}

	// There will always be a Minkconf.js file in the root of the Minkserv package
	const dirRelativeToThisFile = path.dirname(__filename)
	const DefaultMinkconfFile = filesys.findFileUp(dirRelativeToThisFile, 'Minkconf.js')

	return DefaultMinkconfFile
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

	Config.log = Log(cli)

	return Config
}

module.exports = Config

