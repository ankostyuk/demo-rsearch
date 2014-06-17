//
module.exports = function(grunt) {
    //
    grunt.initConfig({
        clean: ['node_modules', 'bower_components'],

        bower: {
            install: {
                options: {
                    targetDir: 'test/bower-components',
                    layout: 'byComponent',
                    install: true,
                    verbose: true,
                    cleanTargetDir: true,
                    cleanBowerDir: false,
                    bowerOptions: {
                        forceLatest: true,
                        production: false
                    }
                }
            }
        }
    });

    //
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
};
