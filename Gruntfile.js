//
module.exports = function(grunt) {
    //
    grunt.initConfig({
        clean: {
            deps: ['node_modules', 'bower_components'],
            dist: ['dist']
        },

        jshint: {
            options: {
                force: true,
                browser: true,
                '-W069': true
            },
            src: ['src/**/*.js']
        },

        copy: {
            dist: {
                expand: true,
                cwd: 'src/',
                src: ['**/*.js', '**/*.html', '**/*.css', '**/*.less'],
                dest: 'dist/'
            },
            docs: {
                src: 'rsearch.md',
                dest: 'dist/'
            }
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
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-bower-task');

    //
    grunt.registerTask('init', ['bower']);
    grunt.registerTask('build', ['init', 'jshint']);
    grunt.registerTask('dist', ['clean:dist', 'build', 'copy']);
};
