import test from 'ava'

const paths = require('app/lib/http/paths')

const normalizeChecks = [
	['/../something', '/something'],
	['../something', '../something'],
	['./abc/../abc', 'abc']
]

normalizeChecks.forEach(check => {
	const [input, expected] = check

	test(`.normalize(): "${input}" should normalize to "${expected}"`, t => {
		const actual = paths.normalized(input)
		t.is(actual, expected)
	})
})

const absoluteBase = '/Users/user/dir'

const absoluteChecks = [
	['/', '/Users/user/dir/'],
	['/test/', '/Users/user/dir/test/'],
	['test/', '/Users/user/dir/test/'],
	['test', '/Users/user/dir/test'],
	['../test/', '/Users/user/test/']
]

absoluteChecks.forEach(check => {
	const [input, expected] = check
	test(`.absolute(): "${input}" should resolve to "${expected}"`, t => {
		const actual = paths.absolute(absoluteBase, input)
		t.is(actual, expected)
	})
})
