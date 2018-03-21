const handler = $uri => new Promise(resolve => {
	const payload = {
		code: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		body: `<p>You requested the file: ${$uri}</p>`
	}

	resolve(payload)
})

const plugin = {
	handler
}

module.exports = mink => mink(plugin)
