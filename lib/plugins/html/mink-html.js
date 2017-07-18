module.exports = () => {
	return uri => new Promise(resolve => {
		console.log(`Plugin: mink-file: ${uri}`)

		const payload = {
			code: 200,
			headers: {
				'Content-Type': 'text/html'
			},
			body: `<div><h1>MINK-HTML-PLUG: ${uri}</h1><!-- comment --></div>`
		}

		resolve(payload)
	})
}
