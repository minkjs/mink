const path = require('path')

const log = require('app/lib/core/log')
const filesys = require('app/lib/core/filesys')

const handlers = {}
const templates = {}

const moduleLoaders = {
	nodeModules: (MinkconfRoot, name) => {
		try {
			const mod = require(name)
			return mod
		} catch (err) {
			log.error(err)
			return moduleLoaders.nodeModules(name)
		}
	},

	script: (MinkconfRoot, name) => {
		try {
			const uri = path.join(MinkconfRoot, name)
			const mod = require(uri)
			return mod
		} catch (err) {
			log.error(err)
			return false
		}
	}
}

const loadModule = (MinkconfRoot, name) => {
	return moduleLoaders.script(MinkconfRoot, name)
}

const loadTemplate = (MinkconfRoot, file) => {
	try {
		const uri = path.join(MinkconfRoot, file)
		const template = filesys.loadFileSync(uri)
		return template
	} catch (err) {
		log.error(err)
		return false
	}
}

const init = config => {
	const routeList = []

	config.MinkconfData.plugins.forEach(plugin => {
		routeList.push(plugin)
	})

	routeList.forEach(route => {
		const {path: pattern, module, template, tag} = route

		const mink = {
			root: config.MinkconfRoot,
			log
		}

		const handler = {
			module,
			pattern: pattern || null,
			callback: loadModule(config.MinkconfRoot, module)(mink),
			tag: tag || null
		}

		if (template) {
			handler.template = loadTemplate(config.MinkconfRoot, template)
		}

		handlers[module] = handler
	})
}

module.exports = {
	init,
	handlers,
	templates,
	loadTemplate
}
