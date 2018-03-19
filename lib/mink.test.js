import test from 'ava'

import mink from './mink'

test('mink(): should init/construct in api mode', async t => {
	const argv = ['--system-under-test', 'true']
	const minkService = await mink(argv)

	t.is(typeof minkService, 'object')
	t.is(typeof minkService.config, 'object')
	t.is(typeof minkService.httpServer, 'object')
})
