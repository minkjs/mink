import Service from 'app/lib/core/service'

import test from 'ava'

test('Service(): should return initialized mink server', async t => {
	const argv = ['--system-under-test', 'true']
	const service = await Service(argv)

	t.is(typeof service, 'object')
	t.is(typeof service.config, 'object')
	t.is(typeof service.httpServer, 'object')
})
