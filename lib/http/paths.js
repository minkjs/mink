const path = require('path')

const normalized = requestUri => {
	return path.normalize(requestUri)
}

/**
* Turns a relative request path into a absolute system path
* that is relative to the MinkconfRoot. The absolute path is
* used to get valid references to files that will be read
* from the file system for processing.
* @ method
* @param {string} base - the base uri (usually the Minkconf root)
* @param {string} requestUri - the request URI relative to
* the root of the MinkconfRoot
*/
const absolute = (base, requestUri) => {
	return path.join(base, requestUri)
}

module.exports = {
	normalized,
	absolute
}
