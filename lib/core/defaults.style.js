const DEFAULT_MARK_STYLE = ['bgGreen', 'black', 'bold']

module.exports = {
	MARK: {
		TRACE: DEFAULT_MARK_STYLE,
		DEBUG: DEFAULT_MARK_STYLE,
		INFO: DEFAULT_MARK_STYLE,
		WARN: ['bgYellow', 'black', 'bold'],
		ERROR: ['bgRed', 'white', 'bold'],
		FATAL: ['bgWhite', 'black', 'bold']
	},

	LEVEL: {
		TRACE: ['italic', 'blue'],
		DEBUG: ['italic', 'magenta'],
		INFO: ['italic', 'green'],
		WARN: ['italic', 'yellow'],
		ERROR: ['italic', 'white'],
		FATAL: ['italic', 'white', 'bold', 'underline']
	},

	MESSAGE: {
		TRACE: ['grey'],
		DEBUG: ['white'],
		INFO: ['white'],
		WARN: ['white'],
		ERROR: ['red'],
		FATAL: ['red']
	},

	SYNTAX: {
		BASE: ['bgRed', 'gray'],
		NUMBER: ['bgBlack', 'blue'],
		KEY: ['bgBlack', 'white'],
		STRING: ['bgBlack', 'yellow'],
		BOOLEAN: ['bgBlack', 'magenta'],
		NULL: ['bgBlack', 'red']
	}
}
