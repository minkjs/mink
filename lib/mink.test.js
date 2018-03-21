import test from 'ava'

import mink from './mink'

test.cb('mink(): should init/construct in api mode', t => {
	const argv = ['--system-under-test', 'true']
	mink(argv).then(minkService => {
		t.is(typeof minkService, 'object')
		t.is(typeof minkService.config, 'object')
		t.is(typeof minkService.httpServer, 'object')
		minkService.server.close().then(t.end)
	})
})
