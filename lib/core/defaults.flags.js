module.exports = {
	'log-level': {
		type: 'string',
		alias: 'l',
		default: 'INFO'
	},
	'log-level-file': {
		type: 'string',
		alias: 'f',
		default: 'WARN'
	},
	'log-color': {
		type: 'boolean',
		alias: 'c',
		default: true
	},
	// Do not pipe output to console while system under test
	'system-under-test': {
		type: 'boolean',
		alias: 'u',
		default: false
	}
}
