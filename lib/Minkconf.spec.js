const path = require('path')
const chai = require('chai')
const Minkconf = require('app/Minkconf.js')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename).split('.spec')[0] + '.js'

describe(specPath, () => {
	it('should provide a Minkconf oject', () => {
		expect(Minkconf).to.be.an('objec')
	})
})
