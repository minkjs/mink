const cheerio = require('cheerio')

const traverse = elem => new Promise(resolve => {
	elem[0].children.forEach(element => {
		console.log(element.name, element.type)

		if (element.type === 'tag' && element.name === 'comment') {
			console.log('woo!')
		}

		if (element.children.length > 0) {
			traverse(element.children)
		}
	})

	resolve(elem)
})

const scan = html => new Promise((resolve, reject) => {
	console.log('Scanning HTML for <!--mink--> tags')

	resolve(html)

	const $DOM = cheerio.load(html)
	const root = $DOM.root()

	traverse(root).then(result => {
		const finalResult = result.html()
		resolve(finalResult)
	}).catch(err => {
		reject(err)
	})
})

module.exports = {
	traverse,
	scan
}
