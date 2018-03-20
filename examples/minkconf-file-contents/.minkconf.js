const Minkconf = {
	data: {},
	plugins: {
		text: {
			path: '**/*.txt',
			handler: (file, res) => {
				res.end(file.contents)
			}
		}
	}
}

module.exports = Minkconf