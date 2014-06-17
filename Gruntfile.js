//
module.exports = function(grunt) {
    //
    grunt.initConfig({
        clean: ['node_modules', 'bower_components'],

        jshint: {
            options: {
                force: true,
                browser: true,
                '-W069': true
            },
            src: ['src/**/*.js']
        },

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
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-bower-task');
};
