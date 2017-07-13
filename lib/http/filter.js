const cheerio = require('cheerio')
const log = require('app/lib/core/log')

module.exports = config => {
	console.log(config)

	const Filter = {}

	Filter.collectTags = html => {
		const $DOM = cheerio.load(html)
		log.info('')
		return $DOM
	}

	return Filter
}
