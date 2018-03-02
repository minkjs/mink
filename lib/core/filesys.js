const path = require('path')
const fs = require('fs-extra')

const directoryExists = dir => new Promise(resolve => {
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

const dirExistsSync = dir => {
	let exists

	try {
		const stat = fs.statSync(dir)
		if (stat.isDirectory()) {
			exists = true
		}
	} catch (err) {
		exists = false
	}

	return exists
}

const fileExistsSync = uri => {
	let exists

	try {
		const stat = fs.statSync(uri)
		if (stat.isFile()) {
			exists = true
		}
	} catch (err) {
		exists = false
	}

	return exists
}

const fileExists = filepath => new Promise(resolve => {
	try {
		fs.stat(filepath, (error, stat) => {
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

const findFileUp = (dir, fileToFind) => {
	const filepath = path.join(dir, fileToFind)
	const existsHere = fileExistsSync(filepath)

	if (dir === path.sep || dir === '.') {
		return false
	}

	if (existsHere) {
		return filepath
	}

	const nextDirUp = path.dirname(dir)
	return findFileUp(nextDirUp, fileToFind)
}

const loadFileSync = uri => {
	let contents

	try {
		contents = fs.readFileSync(uri).toString()
	} catch (err) {
		contents = ''
	}

	return contents
}

module.exports = {
	dirExistsSync,
	directoryExists,
	fileExistsSync,
	fileExists,
	findFileUp,
	loadFileSync
}
