module.exports = function(grunt) {
	grunt.initConfig({
		jshint: {
			all: ['pixelmanipulator.js','Gruntfile.js'],
		},
		uglify: {
			options: {
				mangle: {
					reserved: ['p','pixelManipulator'],
				},
			},
			myTarget: {
				files: {
					//'dest/output.min.js': ['src/input1.js', 'src/input2.js'],
					'pixelmanipulator.min.js': ['pixelmanipulator.js'],
				},
			},
		},
	});
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('compile', ['uglify:myTarget']);
	grunt.registerTask('test1',function() {
		return true;
	});
	grunt.registerTask('testAll',['test1']);
	grunt.registerTask('default', ['jshint:all','compile','testAll']);
};
