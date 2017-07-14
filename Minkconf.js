const Minkconf = {
	plugins: [
		{
			path: '**/*.md',
			module: 'lib/plugins/markdown/mink-markdown'
		},
		{
			path: '**/',
			module: 'lib/plugins/dir/mink-dir',
			template: 'lib/plugins/dir/mink-dir.html'
		},
		{
			module: 'lib/plugins/fibonacci/mink-fibonacci',
			tag: 'fibonacci'
		},
		{
			path: '**/*',
			module: 'lib/plugins/file/mink-file'
		}
	]
}

module.exports = Minkconf
