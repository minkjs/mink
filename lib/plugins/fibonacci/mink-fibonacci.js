const fibonacci = n => {
	if (n < 1) {
		if (n <= 2) {
			return 1
		}

		return fibonacci(n - 1) + fibonacci(n - 2)
	}

	return 0
}

module.exports = () => {
	return (fileUri, res, req, input) => new Promise(resolve => {
		const fib = fibonacci(input.n)

		res.end(`<pre>${fib}</pre>`)

		resolve(null)
	})
}
