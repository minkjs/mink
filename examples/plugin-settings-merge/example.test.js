import path from 'path'
import test from 'ava'

import mink from '../../lib/mink'

test.cb('plugin settings merge', t => {
	const dir = path.join(__dirname, '.minkconf.js')

	const argv = [
		'--dir', dir,
		'--system-under-test', 'true'
	]

	const req = {
		url: '/'
	}

	mink(argv).then(minkService => {
		const res = {
			writeHead: () => {
			},
			write: () => {
			},
			end: result => {
				t.is(typeof result, 'string')

				const response = JSON.parse(result)
				t.is(typeof response.fromModule, 'string')
				t.is(response.fromModule, 'foo')
				t.is(typeof response.fromMinkconf, 'string')
				t.is(response.fromMinkconf, 'bar')
				t.is(typeof response.overWriteMe, 'number')
				t.is(response.overWriteMe, 456)

				minkService.server.close().then(t.end)
			}
		}

		minkService.requests.requestHandler(req, res)
	})
})
