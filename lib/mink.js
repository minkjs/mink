#!/usr/bin/env node

/**
 * The main bin module that triggers initialization of Mink in CLI or API
 * mode. API Mode is used when requiring Mink in another project, or testing
 * the codebase.
 * @module Mink
 */

const Service = require('app/lib/core/service')

/**
 * Module exports
 * @param {argv} - array of arguments from the terminal or api
 * @returns {Mink}
 */

module.exports = argv => {
	const Mink = {}

	Mink.service = Service(argv)

	return Mink
}

const CLI = !module.parent

if (CLI) {
	module.exports = Service(process.argv.slice(2)).service
}
