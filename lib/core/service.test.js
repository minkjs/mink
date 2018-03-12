import Service from 'app/lib/core/service'

import test from 'ava'

test('should return initialized mink server', t => {
	const argv = ['--system-under-test', 'true']
	const service = Service(argv)

	t.is(typeof service, 'object')
	t.is(typeof service.config, 'object')
	t.is(typeof service.httpServer, 'object')
})
