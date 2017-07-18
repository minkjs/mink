const cheerio = require('cheerio')

module.exports = () => {
	const Filter = {}

	Filter.traverse = elem => new Promise(resolve => {
		elem[0].children.forEach(element => {
			console.log(element.name, element.type)

			if (element.type === 'tag' && element.name === 'comment') {
				console.log('woo!')
			}

			if (element.children.length > 0) {
				Filter.traverse(element.children)
			}
		})

		resolve(elem)
	})

	Filter.scan = html => new Promise((resolve, reject) => {
		console.log('Scanning HTML for <!--mink--> tags')

		resolve(html)

		const $DOM = cheerio.load(html)
		const root = $DOM.root()

		Filter.traverse(root).then(result => {
			const finalResult = result.html()
			resolve(finalResult)
		}).catch(err => {
			reject(err)
		})
	})

	return Filter
}
