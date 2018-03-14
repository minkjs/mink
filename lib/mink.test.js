import test from 'ava'

import Mink from 'app/lib/mink'

test('Mink(): should init/construct in api mode', async t => {
	const argv = ['--system-under-test', 'true']
	const mink = await Mink(argv)

	t.is(typeof mink, 'object')
	t.is(typeof mink.config, 'object')
	t.is(typeof mink.httpServer, 'object')
})
