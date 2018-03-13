import path from 'path'
import Log from 'app/lib/core/log'

import test from 'ava'

const stylePath = path.join(__dirname, 'defaults.style.js')
const DEFAULT_STYLES = require(stylePath)

test('Log() should instantiate', t => {
	t.is(typeof Log, 'function')
	const cli = {flags: {}}
	const log = Log(cli)
	t.is(typeof log, 'object')
})

test('.syntaxHighlight(): highlights JavaScript object', t => {
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
	t.is(typeof highlighted, 'string')
	t.is(highlighted, '\u001b[40m\u001b[90m\n{\n  \u001b[37m"foo":\u001b[90m \u001b[33m"bar"\u001b[90m,\n  \u001b[37m"baz":\u001b[90m \u001b[34m1337\u001b[90m,\n  \u001b[37m"qux":\u001b[90m \u001b[35mtrue\u001b[90m,\n  \u001b[37m"zxc":\u001b[90m \u001b[31mnull\u001b[90m,\n  \u001b[37m"spqr":\u001b[90m \u001b[33m"function (a, b) {\n        return b - a;\n      }"\u001b[90m\n}\u001b[39m\u001b[49m')
})

test('.decorate(): w/ monochrome combines Mink Mark, level, and error message', t => {
	const cli = {flags: {}}
	const log = Log(cli)
	const output = log.decorate('Hull breach!', 'WARN')
	t.is(typeof output, 'string')
	t.is(output, 'MINK |  <warn> - Hull breach!')
})

test('.decorate(): w/ colors combines Mink Mark, level, and error message', t => {
	const cli = {flags: {}}
	const log = Log(cli)
	const activeStyles = log.activateStyles(DEFAULT_STYLES)
	const output = log.decorate('Hull breach!', 'FATAL', activeStyles)
	t.is(typeof output, 'string')
	t.is(output, '\u001b[47m\u001b[30m\u001b[1m MINK \u001b[22m\u001b[39m\u001b[49m \u001b[3m\u001b[37m\u001b[1m\u001b[4m<fatal>\u001b[24m\u001b[22m\u001b[39m\u001b[23m \u001b[31mHull breach!\u001b[39m')
})

test('.toConsole(): w/ formatted highlighted details combines Mink Mark, level, and error message', t => {
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

	t.is(typeof output, 'string')
	t.is(output, '\u001b[43m\u001b[30m\u001b[1m MINK \u001b[22m\u001b[39m\u001b[49m \u001b[3m\u001b[33m <warn>\u001b[39m\u001b[23m \u001b[37mHull breach!\u001b[39m\u001b[40m\u001b[90m\n{\n  \u001b[37m"foo":\u001b[90m \u001b[33m"bar"\u001b[90m\n}\u001b[39m\u001b[49m\n\u001b[40m\u001b[90m\n{\n  \u001b[37m"baz":\u001b[90m \u001b[33m"qux"\u001b[90m\n}\u001b[39m\u001b[49m\n')
})
