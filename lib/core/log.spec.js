const path = require('path')
const chai = require('chai')
const Log = require('app/lib/core/log')

const expect = chai.expect

const specPath = path.relative(process.cwd(), __filename)
const stylePath = path.join(__dirname, 'defaults.style.js')
const DEFAULT_STYLES = require(stylePath)

describe(specPath, () => {
	describe('Log', () => {
		it('should instantiate', () => {
			expect(Log).to.be.a('function')
			const cli = {flags: {}}
			const log = Log(cli)
			expect(log).to.be.an('object')
		})
	})

	describe('.syntaxHighlight()', () => {
		it('highlights JavaScript object', () => {
			const cli = {flags: {}}
			const log = Log(cli)
			const jsObject = {
				foo: 'bar',
				baz: 1337,
				qux: true,
				zxc: null,
				// eslint-disable-next-line object-shorthand
				spqr: function (a, b) {
					return b - a
				}
			}
			const highlighted = log.syntaxHighlight(jsObject)
			expect(highlighted).to.be.a('string')
			expect(highlighted).to.equal('\u001b[40m\u001b[90m\n{\n  \u001b[37m"foo":\u001b[90m \u001b[33m"bar"\u001b[90m,\n  \u001b[37m"baz":\u001b[90m \u001b[34m1337\u001b[90m,\n  \u001b[37m"qux":\u001b[90m \u001b[35mtrue\u001b[90m,\n  \u001b[37m"zxc":\u001b[90m \u001b[31mnull\u001b[90m,\n  \u001b[37m"spqr":\u001b[90m \u001b[33m"function (a, b) {\n            return b - a\n          }"\u001b[90m\n}\u001b[39m\u001b[49m')
		})
	})

	describe('.decorate() w/ monochrome', () => {
		it('combines Mink Mark, level, and error message', () => {
			const cli = {flags: {}}
			const log = Log(cli)
			const output = log.decorate('Hull breach!', 'WARN')
			expect(output).to.be.a('string')
			expect(output).to.equal('MINK |  <warn> - Hull breach!')
		})
	})

	describe('.decorate() w/ colors', () => {
		it('combines Mink Mark, level, and error message', () => {
			const cli = {flags: {}}
			const log = Log(cli)
			const activeStyles = log.activateStyles(DEFAULT_STYLES)
			const output = log.decorate('Hull breach!', 'FATAL', activeStyles)
			expect(output).to.be.a('string')
			expect(output).to.equal('\u001b[47m\u001b[30m\u001b[1m MINK \u001b[22m\u001b[39m\u001b[49m \u001b[3m\u001b[37m\u001b[1m\u001b[4m<fatal>\u001b[24m\u001b[22m\u001b[39m\u001b[23m \u001b[31mHull breach!\u001b[39m')
		})
	})

	describe('.toConsole() w/ formatted highlighted details', () => {
		it('combines Mink Mark, level, and error message', () => {
			const cli = {
				flags: {
					logLevel: 'TRACE',
					logColor: true,
					systemUnderTest: true
				}
			}
			const log = Log(cli)
			const details1 = {
				foo: 'bar'
			}
			const details2 = {
				baz: 'qux'
			}
			const activeStyles = log.activateStyles(DEFAULT_STYLES)
			log.settings.styles = activeStyles
			const output = log.toConsole(
				'Hull breach!',
				'WARN',
				activeStyles,
				details1,
				details2
			)

			expect(output).to.be.a('string')
			expect(output).to.equal('\u001b[43m\u001b[30m\u001b[1m MINK \u001b[22m\u001b[39m\u001b[49m \u001b[3m\u001b[33m <warn>\u001b[39m\u001b[23m \u001b[37mHull breach!\u001b[39m\u001b[40m\u001b[90m\n{\n  \u001b[37m"foo":\u001b[90m \u001b[33m"bar"\u001b[90m\n}\u001b[39m\u001b[49m\n\u001b[40m\u001b[90m\n{\n  \u001b[37m"baz":\u001b[90m \u001b[33m"qux"\u001b[90m\n}\u001b[39m\u001b[49m\n')
		})
	})
})
