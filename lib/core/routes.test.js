import test from 'ava'

import configMockGen from '../../mock/config.log'
import _routes from './routes'

const configMock = configMockGen()

test('should instantiate', t => {
	t.is(typeof _routes, 'function')
	const routes = _routes(configMock)
	t.is(typeof routes, 'object')
})

test('.getModuleType(name): correctly identifies a Node Module', t => {
	const routes = _routes(configMock)
	const moduleType = routes.getModuleType('less')
	t.is(typeof moduleType, 'string')
	t.is(moduleType, 'nodeModule')
})

test('.getModuleType(name): identifies local JS files starting w/ [a-z] chars', t => {
	const routes = _routes(configMock)
	const moduleType = routes.getModuleType('lib/something.js')
	t.is(typeof moduleType, 'string')
	t.is(moduleType, 'localJavaScript')
})

test('.getModuleType(name): identifies local JS files starting w/ period chars', t => {
	const routes = _routes(configMock)
	const moduleType = routes.getModuleType('./lib/something.js')
	t.is(typeof moduleType, 'string')
	t.is(moduleType, 'localJavaScript')
})

test('.loadModule.localJavaScript(): should THROW for a non-existant local JS file', t => {
	const routes = _routes(configMock)
	const error = t.throws(() => {
		routes.moduleLoaders.localJavaScript('./foo/', 'bar')
	})
	t.is(error.message, 'Cannot find module \'foo/bar\'')
})

test('.loadModule.nodeModule(): should THROW when loading a non-existent Node Module', t => {
	const routes = _routes(configMock)
	const nonExistentModule = 'foobar-' + Number(new Date())
	const error = t.throws(() => {
		routes.moduleLoaders.nodeModule(nonExistentModule)
	})
	t.is(error.message, `Cannot find module '${nonExistentModule}'`)
})

test('.constructPlugin(): should load with VALID plugin architecture', t => {
	const routes = _routes(configMock)

	const pluginName = 'my-plugin'
	const myPlugin = () => {
		return () => {}
	}
	const minkHelpers = {}

	const livePlugin = routes.constructPlugin(pluginName, myPlugin, minkHelpers)
	t.is(typeof livePlugin, 'function')
})

test('.constructPlugin(): should THROW when passed an INVALID plugin', t => {
	const routes = _routes(configMock)

	const pluginName = 'my-plugin'
	const myPlugin = {}
	const minkHelpers = {}

	const error = t.throws(() => {
		routes.constructPlugin(pluginName, myPlugin, minkHelpers)
	})
	t.is(error.message, `Plugin ${pluginName} was not a Mink plugin`)
})
