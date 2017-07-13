const path = require('path')
const chai = require('chai')
const Mink = require('app/lib/mink')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename).split('.spec')[0] + '.js'

describe(specPath, () => {
	it('should init in api mode', () => {
		const argv = []
		const mink = Mink(argv)

		expect(mink).to.be.an('object')
		expect(mink.service.config).to.be.an('object')
		expect(mink.service.httpServer).to.be.an('object')
	})
})
