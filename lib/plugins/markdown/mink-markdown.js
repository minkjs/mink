const fs = require('fs')
const markdown = require('markdown').markdown

module.exports = () => {
	return fileUri => new Promise((resolve, reject) => {
		fs.readFile(fileUri, 'utf8', (err, content) => {
			if (err) {
				return reject(err)
			}

			const html = markdown.toHTML(content)

			const payload = {
				code: 200,
				headers: {
					'Content-Type': 'text/html'
				},
				body: html
			}

			resolve(payload)
		})
	})
}
