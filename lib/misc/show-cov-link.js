#!/usr/bin/env node
const path = require('path')
const chalk = require('chalk')

const uri = path.join(__dirname, '../../', 'coverage/lcov-report/index.html')

// eslint-disable-next-line no-console
console.log(
	chalk.bgGreen.black(' Coverage Report > ') + ' ' +
	chalk.underline.blue(uri)
)
