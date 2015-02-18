var root = this;

/*
 * config
 *
 */
// i18n
var i18nBundles = [
    // external
    'text!external_components/nullpointer-autokad/l10n/ui/bundle.json',
    'text!external_components/nullpointer-autokad/l10n/ui_keys/bundle.json',
    // internal
    'text!src/l10n/ui/bundle.json',
    'text!src/l10n/ui_keys/bundle.json',
    'text!src/l10n/okato_region/bundle.json',
];

//
root._APP_CONFIG = {
    lang: {
        defaultLang: 'ru',
        langs: ['ru', 'en']
    },
    meta: {
        // Параметр: Объём продаж за последний год
        lastSalesVolumeField: 'p20103_2013',
        currencyOrder: 1000
    }
};

//
root._RESOURCES_CONFIG = {
    baseUrl: '/rsearch',

    paths: {
        'angular':              'external_components/angular/angular',
        'angular-locale_ru':    'external_components/angular-i18n/angular-locale_ru',
        'angular-locale_en':    'external_components/angular-i18n/angular-locale_en',
        'ng-infinite-scroll':   'external_components/ngInfiniteScroll/ng-infinite-scroll',

        'jquery':               'external_components/jquery/jquery',
        'jquery.cookie':        'external_components/jquery.cookie/jquery.cookie',

        'purl':                 'external_components/purl/purl',
        'moment':               'external_components/moment/moment',

        'uuid':                 'external_components/node-uuid/uuid',

        // nkbcomment
        'backbone':                     'external_components/backbone/backbone',
        'iso8601':                      'external_components/iso8601/iso8601',
        'jquery.ui.widget':             'external_components/jquery-file-upload/jquery.ui.widget',
        'jquery.iframe-transport':      'external_components/jquery-file-upload/jquery.iframe-transport',
        'jquery.fileupload':            'external_components/jquery-file-upload/jquery.fileupload',
        'jquery.fileDownload':          'external_components/jquery.fileDownload/jquery.fileDownload',
        'dateformat':                   'external_components/nkbcomment/nkbcomment-lib/dateformat',
        'nkbcomment-defaults':          'external_components/nkbcomment/nkbcomment-defaults/defaults',
        'nkbcomment-message-widget':    'external_components/nkbcomment/nkbcomment-message-widget/js/message-widget',
        'nkbcomment-comment-utils':     'external_components/nkbcomment/nkbcomment-comment-widget/js/comment-utils',
        'nkbcomment-comment-widget':    'external_components/nkbcomment/nkbcomment-comment-widget/js/comment-widget'
    },

    packages: [{
        name: 'app',
        location: 'src/nkb-app',
        main: 'app'
    }, {
        name: 'app.login',
        location: 'src/nkb-app/components/login',
        main: 'login'
    }, {
        name: 'app.lang',
        location: 'src/nkb-app/components/lang',
        main: 'lang'
    }, {
        name: 'app.log',
        location: 'src/nkb-app/components/log',
        main: 'log'
    }, {
        name: 'rsearch',
        location: 'src/rsearch',
        main: 'rsearch'
    },
    /*
     * external packages
     *
     */
    {
        name: 'nkb.comment',
        location: 'src/comment',
        main: 'comment'
    }, {
        name: 'lodash',
        location: 'external_components/nullpointer-commons/lodash'
    }, {
        name: 'nkb.user',
        location: 'external_components/nullpointer-commons/nkb/user',
        main: 'user'
    }, {
        name: 'nkb.icons',
        location: 'external_components/nullpointer-commons/nkb/icons',
        main: 'icons'
    }, {
        name: 'directives',
        location: 'external_components/nullpointer-commons/angular/directives',
        main: 'directives'
    }, {
        name: 'filters',
        location: 'external_components/nullpointer-commons/angular/filters',
        main: 'filters'
    }, {
        name: 'l10n',
        location: 'external_components/nullpointer-commons/angular/l10n',
        main: 'l10n'
    }, {
        name: 'resource',
        location: 'external_components/nullpointer-commons/angular/resource',
        main: 'resource'
    }, {
        name: 'autokad',
        location: 'external_components/nullpointer-autokad/autokad',
        main: 'autokad'
    }, {
        name: 'i18n',
        location: 'external_components/nullpointer-i18n',
        main: 'i18n'
    }],

    shim: {
        'angular': {
            exports: 'angular'
        },
        'ng-infinite-scroll': {
            deps: ['angular']
        },

        'jquery.cookie': {
            deps: ['jquery']
        },

        // nkbcomment
        'backbone': {
            deps: ['lodash']
        },
        'dateformat': {
            deps: ['iso8601']
        },
        'nkbcomment-defaults': {
            deps: ['backbone', 'lodash', 'jquery' /* + остальные зависимости для nkbcomment-comment */, 'jquery.cookie', 'jquery.fileupload', 'jquery.fileDownload', 'dateformat']
        },
        'nkbcomment-comment-utils': {
            deps: ['nkbcomment-defaults']
        },
        'nkbcomment-message-widget': {
            deps: ['nkbcomment-defaults']
        },
        'nkbcomment-comment-widget': {
            deps: ['nkbcomment-defaults', 'nkbcomment-comment-utils', 'nkbcomment-message-widget']
        }
    },

    config: {
        'l10n/l10n': {
            lang: root._APP_CONFIG.lang,
            'i18n-component': {
                // Должны отличаться от общих настроек шаблонизатора,
                // т.к. смысл шаблонизации i18n:
                //   только перевести текст шаблона,
                //   а далее использовать переведённый шаблон с шаблонизатором по умолчанию
                templateSettings: {
                    evaluate:       '',
                    interpolate:    /\$\{([\s\S]+?)\}/g,
                    escape:         ''
                },
                escape: false
            },
            bundles: i18nBundles
        }
    },

    modules: [{
        name: 'app/main',
        include: [
            // locales
            'text!angular-locale_ru.js',
            'text!angular-locale_en.js'
        ].concat(i18nBundles)
    }],

    map: {
        '*': {
            'css': 'external_components/require-css/css',
            'less': 'external_components/require-less/less',
            'text': 'external_components/requirejs-text/text'
        }
    },

    less: {
        relativeUrls: true
    },

    urlArgs: new Date().getTime()
};

/*
 * init
 *
 */
if (typeof define === 'function' && define.amd) {
    requirejs.config(root._RESOURCES_CONFIG);

    require(['app'], function(app){
        // init app
        app.init(document);
    });
}
