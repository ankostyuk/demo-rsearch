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
    var APP_CONFIG      = require('./src/app/config.js'),
        NKB_APP_CONFIG  = require('./src/nkb-app/config.js');

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
            src: [
                'src/app/**/*.js',
                'src/nkb-app/**/*.js',
                'src/l10n/**/*.js',
                'src/rsearch/**/*.js'
            ]
        },

        copy: {
            'dist-app': {
                expand: true,
                flatten: true,
                cwd: 'target/web-resources-build/app',
                src: [
                    'build.properties',
                    'src/app/config.js',
                    'src/app/main.js',
                    'src/bower-components/requirejs/require.js',
                    'example/app/rsearch.css'
                ],
                dest: 'dist/app'
            },
            'dist-nkb-app': {
                expand: true,
                flatten: true,
                cwd: 'target/web-resources-build/nkb-app',
                src: [
                    'build.properties',
                    'src/nkb-app/config.js',
                    'src/nkb-app/main.js',
                    'src/bower-components/requirejs/require.js'
                ],
                dest: 'dist/nkb-app'
            },
            'dist-nkb-app-static': {
                expand: true,
                cwd: 'target/web-resources-build/nkb-app/src/nkb-app/styles/i',
                src: '**',
                dest: 'dist/nkb-app/styles/i/'
            },
            'app-example': {
                expand: true,
                cwd: 'examples/app',
                src: '**',
                dest: 'target/web-resources-build/app/example/app/'
            },
            'nkb-app-example': {
                expand: true,
                cwd: 'examples/nkb-app',
                src: '**',
                dest: 'target/web-resources-build/nkb-app/example/nkb-app/'
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

        'process-resources': {
            build: {
                options: {
                    inputDir: path.resolve(__dirname, 'src'),
                    outputDir: path.resolve(__dirname, 'target/web-resources-process/src'),

                    // значение будет взято из аргумента [grunt process-resources:build:true|false], см. register task web-resources
                    skipProcess: null
                }
            }
        },

        'web-resources': {
            'build-app': {
                options: {
                    propertiesFile: path.resolve(__dirname, 'target/web-resources-build/app/build.properties'),
                    mainFile: path.resolve(__dirname, 'target/web-resources-build/app/src/app/main.js'),

                    requirejs: _.extend({}, APP_CONFIG._RESOURCES_CONFIG, {
                        dir: path.resolve(__dirname, 'target/web-resources-build/app'),
                        baseUrl: path.resolve(__dirname, 'target/web-resources-process'),
                        modules: [{
                            name: 'app/main'
                        }],

                        less: {
                            rootpath: '/',
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

                    // значение будет взято из аргумента [grunt web-resources:build-xxx:true|false], см. register task web-resources
                    skipOptimize: null
                }
            },
            'build-nkb-app': {
                options: {
                    propertiesFile: path.resolve(__dirname, 'target/web-resources-build/nkb-app/build.properties'),
                    mainFile: path.resolve(__dirname, 'target/web-resources-build/nkb-app/src/nkb-app/main.js'),

                    requirejs: _.extend({}, NKB_APP_CONFIG._RESOURCES_CONFIG, {
                        dir: path.resolve(__dirname, 'target/web-resources-build/nkb-app'),
                        baseUrl: path.resolve(__dirname, 'target/web-resources-process'),
                        modules: [{
                            name: 'app/main'
                        }],

                        less: {
                            // TODO разобраться со статикой при деплое
                            rootpath: '/rsearch/',
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

                    // значение будет взято из аргумента [grunt web-resources-xxx:build:true|false], см. register task web-resources
                    skipOptimize: null
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
    grunt.task.registerMultiTask('process-resources', function(skip) {
        var done        = this.async(),
            options     = this.data.options,
            skipProcess = (skip === 'true');

        fs.removeSync(options.outputDir);
        fs.mkdirsSync(options.outputDir);

        wb.processResources.run(_.extend(options, {
            skipProcess: skipProcess
        }), function(){
            done();
        });
    });

    //
    grunt.task.registerMultiTask('web-resources', function(skipOptimize) {
        var done            = this.async(),
            options         = this.data.options,
            skipOptimize    = (skipOptimize === 'true');

        fs.removeSync(options.requirejs.dir);
        fs.mkdirsSync(options.requirejs.dir);

        wb.requirejsOptimize.run(_.extend(options, {
            skipOptimize: skipOptimize
        }), function(){
            done();
        });
    });

    //
    grunt.registerTask('init', ['bower']);
    grunt.registerTask('dist', ['clean:dist', 'copy:dist-app', 'copy:dist-nkb-app', 'copy:dist-nkb-app-static']);
    grunt.registerTask('build', ['clean:src', 'clean:target', 'init', 'jshint', 'process-resources:build:false', 'web-resources:build-app:false', 'web-resources:build-nkb-app:false', 'copy:app-example', 'copy:nkb-app-example', 'dist']);
    grunt.registerTask('cleanup', ['clean:deps', 'clean:src', 'clean:target']);
};
