import path from 'path'
import Config from 'app/lib/core/config'
import filesys from 'app/lib/core/filesys'

import test from 'ava'

test('module.exports: should initialize with config object', t => {
	const argv = []
	const config = Config.init(argv)
	t.is(typeof config, 'object')
})

test('.getMinkconfRoot(): user should be able to define a server root with cli args', t => {
	const userRoot = path.join(path.dirname(__filename))

	const argv = ['--dir', userRoot]
	const config = Config.init(argv)
	const relativeConf = path.relative(userRoot, config.MinkconfRoot)

	t.is(typeof config.MinkconfRoot, 'string')
	t.is(relativeConf, '../..')
})

test('.getMinkconfRoot(): should default to nearest Minkconf.js if no args provded', t => {
	const argv = []
	const config = Config.init(argv)

	const specDirAbs = path.resolve(path.dirname(__filename))
	const MinkconfRootRel = path.relative(specDirAbs, config.MinkconfRoot)

	t.is(typeof config.MinkconfRoot, 'string')
	t.is(MinkconfRootRel, '../..')
})

test('.getMinkconfRoot(): should use cwd as dir if no Minkconf.js is found', t => {
	const bogusPath = path.join(path.sep, 'totally', 'bogus', 'path')

	const argv = ['--dir', bogusPath]
	const config = Config.init(argv)

	t.is(typeof config.MinkconfRoot, 'string')
	t.is(config.MinkconfRoot, process.cwd())
})

test('.getMinkconfRoot(): should use cwd as dir if no Minkconf.js is found and no args are provided', t => {
	const originalCwd = process.cwd()
	const packageJsonUri = filesys.findFileUp(process.cwd(), 'package.json')
	const packageJsonDir = path.dirname(packageJsonUri)
	const outerDir = path.dirname(packageJsonDir)

	process.chdir(outerDir)

	const argv = []
	const config = Config.init(argv)

	// Put the dir back (CAREFUL!)
	process.chdir(originalCwd)

	t.is(typeof config.MinkconfRoot, 'string')
	t.is(config.MinkconfRoot, outerDir)
})

test('.getMinkconfRoot(): should use user provided dir as dir if no Minkconf.js is found and user provided dir exists', t => {
	const originalCwd = process.cwd()
	const packageJsonUri = filesys.findFileUp(process.cwd(), 'package.json')
	const packageJsonDir = path.dirname(packageJsonUri)
	const outerDir = path.dirname(packageJsonDir)

	process.chdir(outerDir)

	const argv = ['--dir', outerDir]
	const config = Config.init(argv)

	// Put the dir back (CAREFUL!)
	process.chdir(originalCwd)

	t.is(typeof config.MinkconfRoot, 'string')
	t.is(config.MinkconfRoot, outerDir)
})

test('.getMinkconfFile(): should find the Mink global package Minkconf.js file if not dir is passed or the dir does contain a Minkconf.js file itself.', t => {
	// REASON: This is because we...

	const argv = []
	const config = Config.init(argv)

	const dir = path.join(path.dirname(__filename))

	// There will always be a Minkconf.js file in the package root
	const packageJsonUri = filesys.findFileUp(process.cwd(), 'package.json')
	const packageJsonDir = path.dirname(packageJsonUri)

	const MinkconfFileUri = config.getMinkconfFile(dir)

	t.is(typeof MinkconfFileUri, 'string')
	t.is(MinkconfFileUri, path.join(packageJsonDir, 'Minkconf.js'))
})
