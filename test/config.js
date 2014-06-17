var root = this;

//
root._RESOURCES_CONFIG = {
    baseUrl: '/rsearch',

    paths: {
        'angular':              'test/bower-components/angular/angular',
        'angular-resource':     'test/bower-components/angular-resource/angular-resource',
        'angular-locale_ru':    'test/bower-components/angular-i18n/angular-locale_ru',

        //'angular-ui-utils':     'test/bower-components/angular-ui-utils/ui-utils',

        //'jquery':               'test/bower-components/jquery/jquery',

        'underscore':           'test/bower-components/underscore/underscore',
        'underscore.string':    'test/bower-components/underscore.string/underscore.string',

        'i18n':                 'bower-components/nullpointer-i18n/i18n'//,

        //'rsearch':              'src/rsearch'
    },

    packages: [{
        name: 'app',
        location: '/rsearch/test',
        main: 'app'
    }, {
        name: 'rsearch',
        location: '/rsearch/src',
        main: 'rsearch'
    }],

    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-resource': {
            deps: ['angular']
        },
        'angular-locale_ru': {
            deps: ['angular']
        },
//        'angular-ui-utils': {
//            deps: ['angular']
//        },

        'underscore': {
            exports: '_',
            deps: ['underscore.string'],
            init: function(UnderscoreString) {
                _.templateSettings = {
                    evaluate:       /\{%([\s\S]+?)%\}/g,
                    interpolate:    /\{%=([\s\S]+?)%\}/g,
                    escape:         /\{%-([\s\S]+?)%\}/g
                };

                _.mixin(UnderscoreString);
            }
        }
    },

    config: {
    },

    map: {
        '*': {
            'css': 'test/bower-components/require-css/css',
            'less': 'test/bower-components/require-less/less',
            'text': 'test/bower-components/requirejs-text/text'
        }
    },

    less: {
        relativeUrls: true
    },

    urlArgs: new Date().getTime()
};
