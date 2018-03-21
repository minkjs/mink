const Minkconf = {
	plugins: {
		foobar: {
			path: '**/',
			handler: './mink-plugin',
			settings: {
				fromMinkconf: 'bar',
				overWriteMe: 456
			}
		}
	}
}

module.exports = Minkconf