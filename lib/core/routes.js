const path = require('path')
const log = require('app/lib/core/log')

const filesys = require('app/lib/core/filesys')()

module.exports = config => {
	const {MinkconfRoot} = config

	const Routes = {
		handlers: {},
		templates: {}
	}

	const moduleLoaders = {
		nodeModules: name => {
			try {
				const mod = require(name)
				return mod
			} catch (err) {
				console.log(err)
				return moduleLoaders.nodeModules(name)
			}
		},

		script: name => {
			try {
				const uri = path.join(MinkconfRoot, name)
				const mod = require(uri)
				return mod
			} catch (err) {
				console.log(err)
				return false
			}
		}
	}

	const loadModule = name => {
		return moduleLoaders.script(name)
	}

	const loadTemplate = file => {
		try {
			const uri = path.join(MinkconfRoot, file)
			const template = filesys.loadFileSync(uri)
			return template
		} catch (err) {
			console.error(err)
			return false
		}
	}

	const routeList = []

	config.MinkconfData.plugins.forEach(plugin => {
		routeList.push(plugin)
	})

	routeList.forEach(route => {
		const {path: pattern, module, template, tag} = route

		const mink = {
			root: MinkconfRoot,
			log
		}

		const handler = {
			module,
			pattern: pattern || null,
			callback: loadModule(module)(mink),
			tag: tag || null
		}

		if (template) {
			handler.template = loadTemplate(template)
		}

		Routes.handlers[module] = handler
	})

	return Routes
}
