import test from 'ava'

const minkconf = require('../.minkconf.js')

test('module.exports: should provide a Minkconf oject', t => {
	t.is(typeof minkconf, 'object')
})
