import path from 'path'
import test from 'ava'

import minkMarkdown from './mink-markdown'

test('markdown file to html', async t => {
	await minkMarkdown(async plugin => {
		const uri = path.join(__dirname, 'test.md')
		const payload = await plugin.handler(uri)
		const expected = {
			code: 200,
			headers: {
				'Content-Type': 'text/html'
			},
			body: '<h1>Working</h1>'
		}
		t.deepEqual(payload, expected)
	})
})

test('fails for bad file', async t => {
	const uri = path.join(__dirname, 'testasd.md')

	const error = await t.throws(
		minkMarkdown(async plugin => plugin.handler(uri))
	)
	const expectedErrMsg = 'ENOENT: no such file or directory, open'
	t.is(error.message.indexOf(expectedErrMsg), 0)
})
