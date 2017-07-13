/**
 * Log - generates output to console and or file
 * @constructor
 * @param {object} config - the Mink Service config
 */

const levels = {
	TRACE: 0,
	DEBUG: 1,
	INFO: 2,
	WARN: 3,
	ERROR: 4,
	FATAL: 5,
	0: 'TRACE',
	1: 'DEBUG',
	2: 'INFO',
	3: 'WARN',
	4: 'ERROR',
	5: 'FATAL'
}

let settings

const initialize = () => {
	settings = {
		file: {
			path: '',
			level: 'warn'
		},

		console: {
			path: '',
			level: ''
		}
	}

	return settings
}

const decorate = (message, level, type) => {
	return [message, level, type]
}

const toConsole = (message, level) => {
	const output = decorate(message, level, 'console')
	console.log(output)

	if (Reflect.has(console, level)) {
		console[level](message)
	}
}

const toFile = (message, level) => {
	return [message, level]
}

const trace = message => {
	toConsole(message, 'log')
}

const debug = message => {
	toConsole(message, 'log')
}

const info = message => {
	toConsole(message, 'info')
}

const warn = message => {
	toConsole(message, 'warn')
}

const error = message => {
	toConsole(message, 'error')
}

const fatal = message => {
	toConsole(message, 'fatal')
}

module.exports = {
	initialize,
	decorate,
	toConsole,
	toFile,

	levels,

	trace,
	debug,
	info,
	warn,
	error,
	fatal
}
