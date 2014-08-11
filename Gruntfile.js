//
var fs      = require('fs-extra'),
    path    = require('path'),
    _       = require('underscore'),
    i18n    = require('nullpointer-i18n-bin'),
    wb      = require('nullpointer-web-bin');

//
module.exports = function(grunt) {
    //
    var APP_LANGS = ['ru', 'en'];

    //
    var WEBAPP_CONFIG = require('./src/app/config.js');

    //
    grunt.initConfig({
        clean: {
            deps: ['node_modules', 'bower_components'],
            src: ['src/bower-components'],
            target: ['target'],
            dist: ['dist']
        },

        jshint: {
            options: {
                force: true,
                browser: true,
                '-W069': true
            },
            src: ['src/app/**/*.js', 'src/rsearch/**/*.js']
        },

        copy: {
            dist: {
                expand: true,
                flatten: true,
                cwd: 'target/web-resources-build/src/',
                src: [
                    'app/config.js',
                    'app/main.js',
                    'bower-components/requirejs/require.js',
                    'examples/nkb/nkb-rsearch.css'
                ],
                dest: 'dist/'
            }
        },

        bower: {
            install: {
                options: {
                    targetDir: 'src/bower-components',
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
        },

        i18n: {
            'ui': {
                options: {
                    pattern:        '**/*.+(js|html)',
                    inputDir:       path.resolve(__dirname, 'src/rsearch'),
                    inputRootPath:  path.resolve(__dirname, ''),
                    outputDir:      path.resolve(__dirname, 'i18n/ui'),
                    bundleDir:      path.resolve(__dirname, 'src/l10n/ui'),
                    baseLang:       APP_LANGS[0],
                    langs:          APP_LANGS
                }
            },
            'okato_region': {
                options: {
                    mode:           'simple',
                    pattern:        '**/*.txt',
                    inputDir:       path.resolve(__dirname, 'i18n/okato_region'),
                    inputRootPath:  path.resolve(__dirname, ''),
                    outputDir:      path.resolve(__dirname, 'i18n/okato_region'),
                    bundleDir:      path.resolve(__dirname, 'src/l10n/okato_region'),
                    baseLang:       APP_LANGS[0],
                    langs:          APP_LANGS
                }
            }
        },

        'web-resources': {
            build: {
                options: {
                    'process-resources': {
                        inputDir: path.resolve(__dirname, 'src'),
                        outputDir: path.resolve(__dirname, 'target/web-resources-process/src'),

                        // значение будет взято из аргумента [grunt web-resources:build:true|false], см. register task web-resources
                        skipProcess: null,
                    },
                    'requirejs-optimize': {
                        propertiesFile: path.resolve(__dirname, 'target/web-resources-build.properties'),
                        mainFile: path.resolve(__dirname, 'target/web-resources-build/app/main.js'),

                        requirejs: _.extend({}, WEBAPP_CONFIG._RESOURCES_CONFIG, {
                            dir: path.resolve(__dirname, 'target/web-resources-build'),
                            baseUrl: path.resolve(__dirname, 'target/web-resources-process'),
                            modules: [{
                                name: 'app/main'
                            }],

                            less: {
                                // к rootpath будет добавлен путь к контексту веб-приложения:
                                // взятый из [grunt web-resources:build:true|false:contextPath], см. register task web-resources
                                rootpath: '/xxx/',
                                relativeUrls: true
                            },

                            optimize: 'uglify2',
                            uglify2: {
                                mangle: true,
                                output: {
                                    comments: /-- DO_NOT_DELETE --/
                                }
                            },

                            removeCombined: false,
                            preserveLicenseComments: false
                        }),

                        // значение будет взято из аргумента [grunt web-resources:build:true|false], см. register task web-resources
                        skipOptimize: null
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
    grunt.task.registerMultiTask('i18n', function(arg1) {
        var done = this.async();

        i18n.run(this.data.options, function(){
            done();
        });
    });

    //
    grunt.task.registerMultiTask('web-resources', function(skipOptimize, contextPath) {
        var done = this.async(),
            data = this.data,
            skip = (skipOptimize === 'true');

        processResources();

        function processResources() {
            var options = data.options['process-resources'];

            fs.removeSync(options.outputDir);
            fs.mkdirsSync(options.outputDir);

            wb.processResources.run(_.extend(options, {
                skipProcess: true //skip // TODO решить проблему с ресурсами для тестовой страницы НКБ
            }), function(){
                requirejsOptimize();
            });
        }

        function requirejsOptimize() {
            var options = data.options['requirejs-optimize'];

            fs.removeSync(options.requirejs.dir);
            fs.mkdirsSync(options.requirejs.dir);

            options.requirejs.less.rootpath = contextPath + options.requirejs.less.rootpath;

            wb.requirejsOptimize.run(_.extend(options, {
                skipOptimize: skip
            }), function(){
                done();
            });
        }
    });

    //
    grunt.registerTask('init', ['bower']);
    grunt.registerTask('build', ['clean:src', 'clean:target', 'init', 'jshint', 'web-resources:build:false']);
    grunt.registerTask('dist', ['copy:dist']);
    grunt.registerTask('cleanup', ['clean:deps', 'clean:src', 'clean:target']);
};
