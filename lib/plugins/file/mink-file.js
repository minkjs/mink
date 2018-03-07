const fs = require('fs')
const path = require('path')
const mime = require('mime')

module.exports = mink => (fileUri, req, res) => new Promise((resolve, reject) => {
	mink.log.info(`Plugin: mink-file: ${fileUri}`)

	const filename = path.basename(fileUri)
	const mimetype = mime.lookup(filename)

	res.setHeader('Content-type', mimetype)

	const fileStream = fs.createReadStream(fileUri)

	fileStream.on('error', err => {
		mink.log.error(err)
		reject(err)
	})

	// Explicitly return nothing to the request handler as we are handling
	// the response ourselves within this plug-in
	fileStream.on('end', () => {
		resolve(null)
	})

	fileStream.pipe(res)
})

