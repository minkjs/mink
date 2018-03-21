const path = require('path')
const merge = require('deepmerge')
const magicParams = require('magic-params')

const filesys = require('./filesys')

const mergeSettings = (activePlugin, routeDef) => {
	let settings = {}

	if (Reflect.has(routeDef, 'settings')) {
		settings = merge(settings, routeDef.settings)
	}

	if (Reflect.has(activePlugin, 'settings')) {
		settings = merge(settings, activePlugin.settings)
	}

	return settings
}

const RoutesConstructor = config => {
	const {log} = config

	const routes = {}

	routes.handlers = {}
	routes.templates = {}
	routes.routeList = {}

	routes.moduleLoaders = {
		nodeModule: name => {
			try {
				const mod = require(name)
				return mod
			} catch (err) {
				log.error(err)
				throw new Error(err.message)
			}
		},

		localJavaScript: (MinkconfRoot, name) => {
			try {
				const uri = path.join(MinkconfRoot, name)
				const mod = require(uri)
				return mod
			} catch (err) {
				log.error(err)
				throw new Error(err.message)
			}
		}
	}

	// A Node Module name contains no URL characters.
	// Therefore: if the base of a parsed path matches
	// the original name, the user had passed a Node
	// Module and not a relative JavaScript URL into
	// the Minkconf.js file.
	routes.getModuleType = name => {
		const base = path.parse(name).base

		if (base === name) {
			return 'nodeModule'
		}

		return 'localJavaScript'
	}

	routes.loadModule = (MinkconfRoot, name) => {
		const moduleType = routes.getModuleType(name)
		if (moduleType === 'nodeModule') {
			return routes.moduleLoaders.nodeModule(name)
		}

		return routes.moduleLoaders.localJavaScript(MinkconfRoot, name)
	}

	routes.loadTemplate = (MinkconfRoot, file) => {
		try {
			const uri = path.join(MinkconfRoot, file)
			const template = filesys.loadFileSync(uri)
			return template
		} catch (err) {
			log.error(err)
			return false
		}
	}

	if (config &&
		Reflect.has(config, 'Minkconf') &&
		Reflect.has(config.Minkconf, 'plugins')
	) {
		Reflect.ownKeys(config.Minkconf.plugins).forEach(pluginName => {
			const plugin = config.Minkconf.plugins[pluginName]
			routes.routeList[pluginName] = plugin
		})
	}

	routes.constructPlugin = (module, plugin, helpers) => {
		if (typeof plugin !== 'function') {
			const errorMsg = `Plugin ${module} was not a Mink plugin`
			log.fatal(errorMsg)
			throw new Error(errorMsg)
		}

		let callback

		try {
			callback = plugin(helpers)
		} catch (err) {
			const errorMsg = `Plugin ${module} could not be initialized`
			log.fatal(errorMsg, err)
			throw new Error(errorMsg)
		}

		return callback
	}

	routes.initPlugin = pluginDef => {
		const activePlugin = {}

		// Maybe we should be more careful about what
		// exact members are allowed, ie: handler, config/settings, etc
		Reflect.ownKeys(pluginDef).forEach(prop => {
			const member = pluginDef[prop]

			if (member instanceof Function) {
				const params = magicParams.list(member)

				activePlugin[prop] = {
					params,
					callback: member
				}
			} else {
				activePlugin[prop] = member
			}
		})

		return activePlugin
	}

	routes.makeModuleHandler = routeDefinition => {
		const {
			handler: moduleToRequire
		} = routeDefinition

		const pluginFn = routes.loadModule(config.MinkconfRoot, moduleToRequire)
		const activePlugin = pluginFn(routes.initPlugin)

		const handlerObject = {
			plugin: activePlugin,
			pattern: routeDefinition.path || null,
			tag: routeDefinition.tag || null,
			settings: mergeSettings(routeDefinition, activePlugin)
		}

		return handlerObject
	}

	routes.makeConfHandler = routeDefinition => {
		const plugin = {
			handler: {
				callback: routeDefinition.handler,
				params: magicParams.list(routeDefinition.handler),
				settings: routeDefinition.settings || {}
			}
		}

		const handlerObject = {
			plugin,
			pattern: routeDefinition.path || null,
			tag: routeDefinition.tag || null,
			settings: mergeSettings(routeDefinition, plugin)
		}

		return handlerObject
	}

	Reflect.ownKeys(routes.routeList).forEach(routeName => {
		const routeDefinition = routes.routeList[routeName]

		let liveHandler = {}

		// Module Handler
		// We are loading a Mink Plugin from .js file or node_module:
		if (typeof routeDefinition.handler === 'string') {
			liveHandler = routes.makeModuleHandler(routeDefinition)
		}

		// Inline Handler (inside of the Minkconf export):
		if (typeof routeDefinition.handler === 'function') {
			liveHandler = routes.makeConfHandler(routeDefinition)
		}

		if (routeDefinition.template) {
			liveHandler.template = routes.loadTemplate(config.MinkconfRoot, routeDefinition.template)
		} else {
			liveHandler.template = false
		}

		routes.handlers[routeName] = liveHandler
	})

	return routes
}

module.exports = RoutesConstructor
