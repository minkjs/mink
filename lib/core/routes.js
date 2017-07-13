const path = require('path')

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
			console.log(1, MinkconfRoot, file)
			const uri = path.join(MinkconfRoot, file)
			const template = filesys.loadFileSync(uri)
			return template
		} catch (err) {
			console.log(err)
			return false
		}
	}

	const routeList = []

	config.MinkconfData.plugins.forEach(plugin => {
		if (Reflect.has(plugin, 'path')) {
			routeList.push(plugin)
		}
	})

	routeList.forEach(route => {
		const {path, module, template} = route

		const mink = {
			root: MinkconfRoot
		}

		const handler = {
			module,
			pattern: path,
			callback: loadModule(module)(mink)
		}

		if (template) {
			handler.template = loadTemplate(template)
		}

		Routes.handlers[module] = handler
	})

	return Routes
}
