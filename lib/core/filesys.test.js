import path from 'path'
import filesys from 'app/lib/core/filesys'

import test from 'ava'

test('.dirExistsSync(): ', t => {
	t.is(typeof filesys, 'object')
})

test(`.dirExistsSync(): "${__dirname}" should exist`, t => {
	const actual = filesys.dirExistsSync(__dirname)
	t.is(actual, true)
})

const bogusDir = path.join(__dirname, 'bogus')
test(`.dirExistsSync(): "${bogusDir}" should not exist`, t => {
	const actual = filesys.dirExistsSync(bogusDir)
	t.is(actual, false)
})

const dirExistChecks = [
	// This is the current directory of this file
	// It should always exist
	['../core', true],

	// This directory is fictional
	['../foobar', false],

	// Stat a file that does exist (this file)
	// But make sure it's not a directory (it's not)
	['../core/paths.spec.js', false]
]

dirExistChecks.forEach(check => {
	const [dir, exists] = check

	test(`.directoryExists(): "${dir}" should exist as a directory="${exists}"`, async t => {
		const absDir = path.join(__dirname, dir)
		const result = await filesys.directoryExists(absDir)
		t.is(result, exists)
	})
})

test(`.fileExistsSync() "${__filename}" should exist`, t => {
	const actual = filesys.fileExistsSync(__filename)
	t.is(actual, true)
})

const bogusFile = path.join(__dirname, 'bogus-file.js')
test(`"${bogusFile}" should not exist`, t => {
	const actual = filesys.fileExistsSync(bogusFile)
	t.is(actual, false)
})

const fileExistChecks = [
	// This is the current directory of this file
	// It should always exist, but not be a file
	['../core', false],

	// Stat a file that does exist (this file)
	['../core/filesys.test.js', true],

	// Stat a file that does NOT exist
	['../core/fake-news.js', false]
]

fileExistChecks.forEach(check => {
	const [dir, exists] = check

	test(`.fileExists(): "${dir}" should exist as a file="${exists}"`, async t => {
		const absDir = path.join(__dirname, dir)

		const result = await filesys.fileExists(absDir)
		t.is(result, exists)
	})
})

test(`.findFileUp(): package.json should exist 3 levels up`, t => {
	const packageJsonUri = filesys.findFileUp(__dirname, 'package.json')
	const actual = path.relative(__dirname, packageJsonUri)
	t.is(actual, '../../package.json')
})

test(`.findFileUp(): Minkconf.js should exist 1 level up`, t => {
	const minkconfUri = filesys.findFileUp(__dirname, 'Minkconf.js')
	const actual = path.relative(__dirname, minkconfUri)
	t.is(actual, '../../Minkconf.js')
})

test(`.findFileUp(): should return false where file doest not exist up to root`, t => {
	const nonExistantFile = filesys.findFileUp(__dirname, 'bogus-file.js')
	t.is(nonExistantFile, false)
})
