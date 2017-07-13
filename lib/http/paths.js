const path = require('path')
const fs = require('fs')

/**
 * Creates helpers for Paths
 * @constructor
 * @param {object} config - the Minkserv Service config
 */
module.exports = config => {
	const Paths = {}

	Paths.normalized = requestUri => {
		return path.normalize(requestUri)
	}

	/**
	* Turns a relative request path into a absolute system path
	* that is relative to the MinkconfRoot. The absolute path is
	* used to get valid references to files that will be read
	* from the file system for processing.
	* @ method
	* @param {string} requestUri - the request URI relative to
	* the root of the MinkconfRoot
	*/
	Paths.absolute = requestUri => {
		return path.join(config.MinkconfRoot, requestUri)
	}

	Paths.directoryExists = dir => new Promise(resolve => {
		try {
			fs.stat(dir, (err, stat) => {
				if (err) {
					return resolve(false)
				}

				const isDirectory = stat.isDirectory()

				resolve(isDirectory)
			})
		} catch (err) {
			resolve(false)
		}
	})

	Paths.fileExists = path => new Promise(resolve => {
		try {
			fs.stat(path, (error, stat) => {
				if (!error && stat.isFile()) {
					return resolve(true)
				}

				// Path is there, but not file (probably dir)
				if (!error && !stat.isFile()) {
					return resolve(false)
				}

				if (error && error.code === 'ENOENT') {
					return resolve(false)
				}
			})
		} catch (err) {
			resolve(false)
		}
	})

	return Paths
}
