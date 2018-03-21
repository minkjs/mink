const handler = settings => new Promise(resolve => {
	const payload = {
		code: 200,
		body: JSON.stringify(settings)
	}
	resolve(payload)
})

const settings = {
	setFromPluginModule: 'foobar'
}

const plugin = {handler, settings}

module.exports = mink => mink(plugin)
