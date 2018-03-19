import test from 'ava'

import service from './service'

test('Service(): should return initialized mink server', async t => {
	const argv = ['--system-under-test', 'true']
	const minkService = await service(argv)

	t.is(typeof minkService, 'object')
	t.is(typeof minkService.config, 'object')
	t.is(typeof minkService.httpServer, 'object')
})
