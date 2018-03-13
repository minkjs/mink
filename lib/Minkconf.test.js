import test from 'ava'

const Minkconf = require('app/Minkconf.js')

test('module.exports: should provide a Minkconf oject', t => {
	t.is(typeof Minkconf, 'object')
})
