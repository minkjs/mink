const Minkconf = {
	plugins: {
		foobar: {
			path: '**/test.txt',
			handler: (res, file) => {
				res.end(file.contents)
			}
		}
	}
}

module.exports = Minkconf
