const Minkconf = {
	plugins: {
		markdown: {
			path: '**/*.md',
			handler: './mink-markdown'
		}
	}
}

module.exports = Minkconf
