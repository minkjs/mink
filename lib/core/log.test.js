import path from 'path'
import test from 'ava'

// Use Unenki to decode console strings with escape characters.
// This provices a string useable for the expected result.
// import unenki from 'unenki'

import logger from './log'

const stylePath = path.join(__dirname, 'defaults.style.js')
const DEFAULT_STYLES = require(stylePath)

test('logger() should instantiate', t => {
	t.is(typeof logger, 'function')
	const cli = {flags: {}}
	const log = logger(cli)
	t.is(typeof log, 'object')
})

test('.syntaxHighlight(): highlights JavaScript object', t => {
	const cli = {flags: {}}
	const log = logger(cli)
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

	const highlighted = log.highlight(jsObject)

	// Console would output colors if `highlighted` was logged
	// console.log(highlighted)

	// Encoding the highlighted string with unenki, gets us the expected result
	// const encoded = unenki.encode(highlighted, {
	// 	force: {
	// 		'\n': '\\n',
	// 		'\'': '\\\''
	// 	}
	// })

	t.is(highlighted, '\u001b[37m\u001b[90m  1 \u001b[37m {                           \u001b[39m\n\u001b[37m\u001b[90m  2 \u001b[37m     \u001b[33mfoo:\u001b[37m \u001b[33m\'bar\'\u001b[37m,             \u001b[39m\n\u001b[37m\u001b[90m  3 \u001b[37m     \u001b[33mbaz:\u001b[37m \u001b[32m1337\u001b[37m,              \u001b[39m\n\u001b[37m\u001b[90m  4 \u001b[37m     \u001b[33mqux:\u001b[37m \u001b[35mtrue\u001b[37m,              \u001b[39m\n\u001b[37m\u001b[90m  5 \u001b[37m     \u001b[33mzxc:\u001b[37m \u001b[35mnull\u001b[37m,              \u001b[39m\n\u001b[37m\u001b[90m  6 \u001b[37m     \u001b[33mspqr:\u001b[37m \u001b[37m\u001b[37m\u001b[31mfunction\u001b[37m (\u001b[34ma, b\u001b[37m) \u001b[37m{\u001b[37m \u001b[39m\n\u001b[37m\u001b[90m  7 \u001b[37m \u001b[37m            \u001b[31mreturn\u001b[37m b - a;\u001b[37m   \u001b[39m\n\u001b[37m\u001b[90m  8 \u001b[37m \u001b[37m        }\u001b[37m                   \u001b[39m\n\u001b[37m\u001b[90m  9 \u001b[37m }                           \u001b[39m\n\u001b[37m\u001b[39m')
})

test('.decorate(): w/ monochrome combines Mink Mark, level, and error message', t => {
	const cli = {flags: {}}
	const log = logger(cli)
	const output = log.decorate('Hull breach!', 'WARN')
	t.is(typeof output, 'string')
	t.is(output, 'MINK |  <warn> - Hull breach!')
})

test('.decorate(): w/ colors combines Mink Mark, level, and error message', t => {
	const cli = {flags: {}}
	const log = logger(cli)
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
	const log = logger(cli)
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

	// Encoding the highlighted string with unenki, gets us the expected result
	// const encoded = unenki.encode(output, {
	// 	force: {
	// 		'\n': '\\n',
	// 		'\'': '\\\''
	// 	}
	// })
	// console.log(encoded)

	t.is(output, '\u001b[43m\u001b[30m\u001b[1m MINK \u001b[22m\u001b[39m\u001b[49m \u001b[3m\u001b[33m \u003cwarn\u003e\u001b[39m\u001b[23m \u001b[37mHull breach!\u001b[39m\n\u001b[37m\u001b[90m 1 \u001b[37m {              \u001b[39m\n\u001b[37m\u001b[90m 2 \u001b[37m     \u001b[33mfoo:\u001b[37m \u001b[33m\'bar\'\u001b[37m \u001b[39m\n\u001b[37m\u001b[90m 3 \u001b[37m }              \u001b[39m\n\u001b[37m\u001b[39m\n\n\u001b[37m\u001b[90m 1 \u001b[37m {              \u001b[39m\n\u001b[37m\u001b[90m 2 \u001b[37m     \u001b[33mbaz:\u001b[37m \u001b[33m\'qux\'\u001b[37m \u001b[39m\n\u001b[37m\u001b[90m 3 \u001b[37m }              \u001b[39m\n\u001b[37m\u001b[39m\n')
})
