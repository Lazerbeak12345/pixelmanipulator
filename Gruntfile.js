module.exports = function(grunt) {
	grunt.initConfig({
		jshint: {
			all: ['pixelmanipulator.js'],
		},
		uglify: {
			options: {
				mangle: {
					reserved: ['p','pixelManipulator'],
				},
			},
			my_target: {
				files: {
					//'dest/output.min.js': ['src/input1.js', 'src/input2.js'],
					'pixelmanipulator.min.js': ['pixelmanipulator.js'],
				},
			},
		},
	});	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['jshint:all','uglify:my_target']);
	grunt.registerTask('compile', ['uglify:my_target']);
};
