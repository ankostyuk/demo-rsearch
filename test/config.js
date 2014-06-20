var root = this;

//
root._APP_CONFIG = {
    lang: 'ru'
};

//
root._RESOURCES_CONFIG = {
    baseUrl: '/rsearch',

    paths: {
        'angular':              'test/bower-components/angular/angular',
        'angular-locale_ru':    'test/bower-components/angular-i18n/angular-locale_ru',
        'angular-locale_en':    'test/bower-components/angular-i18n/angular-locale_en',
        'angular-mocks':        'test/bower-components/angular-mocks/angular-mocks',

        //'angular-ui-utils':     'test/bower-components/angular-ui-utils/ui-utils',

        'jquery':               'test/bower-components/jquery/jquery',

        'underscore':           'test/bower-components/underscore/underscore',
        'underscore.string':    'test/bower-components/underscore.string/underscore.string',

        'i18n':                 'test/bower-components/nullpointer-i18n/i18n'
    },

    packages: [{
        name: 'app',
        location: '/rsearch/test',
        main: 'app'
    }, {
        name: 'l10n',
        location: '/rsearch/test/l10n',
        main: 'l10n'
    }, {
        name: 'rsearch',
        location: '/rsearch/src',
        main: 'rsearch'
    }],

    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-locale_ru': {
            deps: ['angular']
        },
        'angular-locale_en': {
            deps: ['angular']
        },
        'angular-mocks': {
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
        'i18n': {
            // Должны отличаться от общих настроек шаблонизатора (например, underscore),
            // т.к. смысл шаблонизации i18n:
            //   только перевести текст шаблона,
            //   а далее использовать переведённый шаблон с шаблонизатором по умолчанию
            templateSettings: {
                evaluate:       '',
                interpolate:    /\$\{([\s\S]+?)\}/g,
                escape:         ''
            },
            escape: false
        }
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
