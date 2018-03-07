const cheerio = require('cheerio')

const FilterConstructor = config => {
	const {log} = config

	const filter = {}

	filter.traverse = elem => new Promise(resolve => {
		elem[0].children.forEach(element => {
			log.info(element.name, element.type)

			if (element.type === 'tag' && element.name === 'comment') {
				log.info('woo!')
			}

			if (element.children.length > 0) {
				filter.traverse(element.children)
			}
		})

		resolve(elem)
	})

	filter.scan = html => new Promise((resolve, reject) => {
		log.info('Scanning HTML for <!--mink--> tags')

		resolve(html)

		const $DOM = cheerio.load(html)
		const root = $DOM.root()

		filter.traverse(root).then(result => {
			const finalResult = result.html()
			resolve(finalResult)
		}).catch(err => {
			reject(err)
		})
	})

	return filter
}

module.exports = FilterConstructor
