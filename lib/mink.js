#!/usr/bin/env node

/**
 * The main bin module that triggers initialization of Mink in CLI or API
 * mode. API Mode is used when requiring Mink in another project, or testing
 * the codebase.
 * @module Mink
 */

const Service = require('app/lib/core/service')

/**
 * Service
 * @param {argv} - array of arguments from the terminal or api
 * @returns {Mink}
 */

module.exports = argv => Service(argv)

const CLI = !module.parent

/* istanbul ignore if */
if (CLI) {
	const args = process.argv.slice(2)
	module.exports = Service(args).service
}
