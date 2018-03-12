import test from 'ava'

const Minkconf = require('app/Minkconf.js')

test('should provide a Minkconf oject', t => {
	t.is(typeof Minkconf, 'object')
})
