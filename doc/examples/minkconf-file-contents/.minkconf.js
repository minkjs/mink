const Minkconf = {
	plugins: {
		whatevs: {
			path: '**/*.txt',
			handler: (file, res) => {
				res.end(file.contents)
			}
		}
	}
}

module.exports = Minkconf