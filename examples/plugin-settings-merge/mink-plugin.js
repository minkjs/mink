const handler = settings => new Promise(resolve => {
	const payload = {
		code: 200,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(settings)
	}

	resolve(payload)
})

const settings = {
	fromModule: 'foo',
	overWriteMe: 123
}

const plugin = {handler, settings}

module.exports = mink => mink(plugin)
