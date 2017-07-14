const Minkconf = {
	plugins: [
		{
			path: '**/*.md',
			module: 'lib/modules/markdown/mink-markdown'
		},
		{
			path: '**/',
			module: 'lib/modules/dir/mink-dir',
			template: 'lib/modules/dir/mink-dir.html'
		},
		{
			module: 'lib/modules/fibonacci/mink-fibonacci',
			tag: 'fibonacci'
		},
		{
			path: '**/*',
			module: 'lib/modules/file/mink-file'
		}
	]
}

module.exports = Minkconf
