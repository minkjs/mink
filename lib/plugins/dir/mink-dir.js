const path = require('path')
const fs = require('fs')

const isDir = (file, $mink) => {
	let isDir

	try {
		isDir = fs.statSync(file).isDirectory()
	} catch (err) {
		$mink.log.error(err)
	}

	return isDir
}

const getType = file => {
	const type = {}

	if (isDir(file)) {
		type.dir = true
		return type
	}

	type.file = true
	return type
}

const buildFileList = (filelist, isRoot, requestPath, $root) => {
	const originUrl = requestPath.split($root)[1]

	return filelist.map(file => {
		const relativeFilepath = isRoot ? file : originUrl + file
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

const isRootDirectory = (root, requestPath) => {
	return path.resolve(requestPath) === path.resolve(root)
}

const handler = ($uri, $root, $req) => new Promise(resolve => {
	const files = fs.readdirSync($uri)
	const isRoot = isRootDirectory($root, $uri)
	const fileList = buildFileList(files, isRoot, $uri, $root)

	const data = {
		dir: $req.url,
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

const plugin = {handler}

module.exports = mink => mink(plugin)
