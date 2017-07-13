# Mink

Remix your Markdown (Pre-Release)

[![Build Status](https://travis-ci.org/F1LT3R/mink.svg?branch=master)](https://travis-ci.org/F1LT3R/mink)
[![Coverage Status](https://coveralls.io/repos/github/F1LT3R/mink/badge.svg?branch=master)](https://coveralls.io/github/F1LT3R/mink?branch=master)
[![Npm Version](https://img.shields.io/npm/v/mink.svg)](https://www.npmjs.com/package/mink)
[![Github Issues](https://img.shields.io/github/issues/f1lt3r/mink.svg)](https://github.com/F1LT3R/mink/issues)
[![Gitter](https://img.shields.io/gitter/room/nwjs/mink.svg)](https://gitter.im/mink)
[![Known Vulnerabilities](https://snyk.io/test/github/f1lt3r/mink/badge.svg)](https://snyk.io/test/github/f1lt3r/mink)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

## About

Mink is a powerful command-line tool used to produce written content for the web. Mink is designed from the ground up for technical writting, blogging and software documentation. Mink lets you slice, dice and remix structured Markdown content in realtime. Mink serves your content while you create, then  exports your flattened project as part of your build pipeline.

## Features

- Simple project configuration file (Markconf.js)
- Mink Server
	+ Serves local directories as content
	+ Markdown files are converted to HTML
	+ Auto-reload on file changes
- Splice structrued content together, Eg:
	+ HTML inside HTML with: `<!-- mink | path/to/foo.html -->`
	+ Markdown inside Markdown with: `<!-- mink | path/to/bar.md -->`
	+ Fetch external content:  `<!-- mink | https://en.wikipedia.org/wiki/Cat -->`
	+ Get the first 100 Fibonacci numbers from a plugin:  `<!-- mink | fibonacci | {n: 100} -->`
- Plugins
	+ Write local project modules with simple plugin architecture
	+ Publish your module to the NPM Registry
	+ Add your module to your `package.json` file
	+ Plugins can have their own Handlebars HTML templates
	+ Plugins can return a `{body}` object to be rendered to a template
	+ Pluings can also override and send the HTTP response themselves
- Export
	+ Export the entire content as HTML to be uploaded
	+ Export directory structure alongside binary files like images
	+ Export to PDF

## Installation

Mink serves Markdown content from anywhere in your filesystem. You can install Mink globally.

```shell
yarn global add mink
```

