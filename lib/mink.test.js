import test from 'ava'

import Mink from 'app/lib/mink'

test('should init in api mode', t => {
	const argv = ['--system-under-test', 'true']
	const mink = Mink(argv)

	t.is(typeof mink, 'object')
	t.is(typeof mink.config, 'object')
	t.is(typeof mink.httpServer, 'object')
})
