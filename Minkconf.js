const Minkconf = {
	plugins: [
		{
			path: '**/*.md',
			module: './lib/plugins/markdown/mink-markdown'
		},
		{
			path: '**/*.html',
			module: './lib/plugins/html/mink-html'
		},
		{
			path: '**/',
			module: 'lib/plugins/dir/mink-dir',
			template: 'lib/plugins/dir/mink-dir.html'
		},

		// Catch-all for "other" content
		// Note: mink-file uses pipes files to your browser
		// without filtering content for <!--mink--> tags
		{
			path: '**/*',
			module: 'lib/plugins/file/mink-file'
		}
	]
}

module.exports = Minkconf
