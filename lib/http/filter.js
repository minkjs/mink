const cheerio = require('cheerio')

const log = require('app/lib/core/log')

const traverse = elem => new Promise(resolve => {
	elem[0].children.forEach(element => {
		log.info(element.name, element.type)

		if (element.type === 'tag' && element.name === 'comment') {
			log.info('woo!')
		}

		if (element.children.length > 0) {
			traverse(element.children)
		}
	})

	resolve(elem)
})

const scan = html => new Promise((resolve, reject) => {
	log.info('Scanning HTML for <!--mink--> tags')

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
