const ts = require('typescript')

const Minkconf = {
	data: {
		foo: 'bar'
	},
	plugins: {
		markdown: {
			path: '**/*.md',
			handler: './lib/plugins/markdown/mink-markdown'
		},
		typescript: {
			path: '**/*.ts',
			handler: ($uri, $res, $data, $file) => {
				// Log all the things
				// console.log($uri)
				// console.log($data)
				// console.log($file)
				const transpiled = ts.transpileModule(String($file.contents), {}).outputText
				$res.end(`uri: ${$uri}, data: ${$data}, ts: ${transpiled}`)
			}
		}

		// Save for later
		// {
		// 	path: '**/*.html',
		// 	module: './lib/plugins/html/mink-html'
		// },
		// {
		// 	path: '**/',
		// 	module: 'lib/plugins/dir/mink-dir',
		// 	template: 'lib/plugins/dir/mink-dir.html'
		// },

		// Catch-all for "other" content
		// Note: mink-file uses pipes files to your browser
		// without filtering content for <!--mink--> tags
		// {
		// 	path: '**/*',
		// 	module: 'lib/plugins/file/mink-file'
		// }
		// {
		// 	path: '**/*',
		// 	module: 'docs/plugin-example-01.js'
		// }
	}
}

module.exports = Minkconf
