const path = require('path')
const fs = require('fs')

module.exports = mink => {
	const isDir = file => {
		let isDir

		try {
			isDir = fs.statSync(file).isDirectory()
		} catch (err) {
			mink.error(err)
		}

		return isDir
	}

	const getType = file => {
		const type = {}

		if (isDir(file)) {
			type.dir = true
			return type
		}

		// Check file status
		// if (mink.helpers.isMinkdownFile(file)) {
			// type.minkdown = true
			// return type
		// }

		type.file = true
		return type
	}

	const buildFileList = (filelist, root, requestPath) => {
		const originUrl = requestPath.split(mink.root)[1]

		return filelist.map(file => {
			const relativeFilepath = root ? file : originUrl + file
			const absoluteFilepath = requestPath + '/' + file
			const filetype = getType(absoluteFilepath)
			let filenameOutput = file
			let fileclass = ''

			if (filetype.dir) {
				filenameOutput += '/'
				fileclass = 'dir'
			}

			if (filetype.markdown) {
				fileclass = 'markdown'
			}

			if (filetype.file) {
				fileclass = 'file'
			}

			// File object for handlebars template list
			const fileDef = {
				path: relativeFilepath,
				name: filenameOutput,
				class: fileclass
			}

			return fileDef
		})
	}

	const isRootDirectory = requestPath => {
		const minkRoot = mink.root
		return path.resolve(requestPath) === path.resolve(minkRoot)
	}

	// Main plugin function responds to a http request
	// main MUST always returns a promise
	return (requestPath, res, req) => new Promise(resolve => {
		const files = fs.readdirSync(requestPath)
		const isRoot = isRootDirectory(requestPath)
		const fileList = buildFileList(files, isRoot, requestPath)

		const data = {
			dir: req.url,
			files: fileList
		}

		// Pass Back to HTTP Request Handler or HTTP Exporter
		const payload = {
			code: 200,
			'content-type': 'text/html',
			data
		}

		resolve(payload)
	})
}
