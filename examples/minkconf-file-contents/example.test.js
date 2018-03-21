import path from 'path'
import fs from 'fs'
import test from 'ava'

import mink from '../../lib/mink'

test.cb('minkconf file contents', t => {
	const expectedPath = path.join(__dirname, 'expected.txt')
	fs.readFile(expectedPath, (err, expected) => {
		if (err) {
			t.fail(err)
		}

		const dir = path.join(__dirname, '.minkconf.js')

		const argv = [
			'--dir', dir,
			'--system-under-test', 'true'
		]

		const req = {
			url: '/expected.txt'
		}

		mink(argv).then(minkService => {
			const res = {
				writeHead: () => {},
				end: result => {
					t.is(typeof result, 'object')
					t.true(result instanceof Buffer)
					t.deepEqual(result, expected)
					minkService.server.close().then(t.end)
				}
			}

			minkService.requests.requestHandler(req, res)
		})
	})
})
