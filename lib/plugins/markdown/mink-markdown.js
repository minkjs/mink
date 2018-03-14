const fs = require('fs')
const markdown = require('markdown').markdown

const handler = $uri => new Promise((resolve, reject) => fs.readFile($uri, 'utf8', (err, result) => {
	if (err) {
		return reject(err)
	}

	const html = markdown.toHTML(result)

	const payload = {
		code: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		body: html
	}

	resolve(payload)
}))

const plugin = {
	settings: {
		unicorns: true
	},
	handler
}

module.exports = mink => mink(plugin)
