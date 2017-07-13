const path = require('path')

const meow = require('meow')

const log = require('app/lib/core/log')
const filesys = require('app/lib/core/filesys')()

const help = `
	Usage
	  $ mink

	Options
	  --minkconf  Minkconf.js file to use
	  --dir  Directory to serve files from

	Examples
	  $ mink -minkconf ~/Desktop/Minkconf.js
`

/**
 * Config - service configuration "properties" only (no methods)
 * @constructor
 * @param {object} argv - CLI flags
 */

module.exports = argv => {
	const Config = {}

	const cwd = process.cwd()
	const cli = meow({help, argv})

	Config.getMinkconfRoot = () => {
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

	Config.getMinkconfFile = uri => {
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

	Config.loadMinkconfJsFile = uri => {
		const MinkconfJSData = require(uri)
		return MinkconfJSData
	}

	Config.setLogLevel = argv => {
		console.log(argv)
		log.info('')
	}

	Config.args = argv
	Config.MinkconfRoot = Config.getMinkconfRoot()
	Config.MinkconfFile = Config.getMinkconfFile(Config.MinkconfRoot)
	Config.MinkconfData = Config.loadMinkconfJsFile(Config.MinkconfFile)

	return Config
}
