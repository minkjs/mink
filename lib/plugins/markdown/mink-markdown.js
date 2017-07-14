module.exports = mink => {
	console.log(mink)

	return fileUri => new Promise(resolve => {
		const payload = {
			code: 200,

			headers: {
				'Content-Type': 'text/plain'
			},

			body: 'MINK MODULE:' + fileUri
		}

		resolve(payload)
	})
}
