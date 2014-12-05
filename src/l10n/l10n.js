/**
 * @module l10n
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';
    var root = window;

                          require('jquery');
                          require('jquery.cookie');

    var angular         = require('angular'),
        i18n            = require('i18n'),
        purl            = require('purl'),
        angularLocale   = require('./angular-locale');

    var uiBundle        = angular.fromJson(require('text!./ui/bundle.json')),
        uiKeysBundle    = angular.fromJson(require('text!./ui_keys/bundle.json')),
        regionBundle    = angular.fromJson(require('text!./okato_region/bundle.json'));

    i18n.setConfig(root._RESOURCES_CONFIG['config']['i18n']);
    i18n.setBundle([uiBundle, uiKeysBundle, regionBundle]);

    //
    var config      = root._APP_CONFIG.lang || {},
        langParam   = 'lang',
        currentLang;

    function resolveLang() {
        currentLang = getLangFromUrl() || getLangFromCookies() || config.defaultLang;
    }

    function getLangFromUrl() {
        var params  = purl().param(),
            lang    = params[langParam];

        if (!lang) {
            return null;
        }

        setLangToCookies(lang);

        return lang;
    }

    function urlWithLang(url, lang) {
        lang = lang || currentLang;

        var u       = purl(url),
            params  = u.param(),
            si      = url.indexOf('?'),
            res     = si > 0 ? url.substring(0, si) : url;

        params[langParam] = lang;

        res += '?' + $.param(params);

        return res;
    }

    function getLangFromCookies() {
        return $.cookie(langParam);
    }

    function setLangToCookies(lang) {
        $.cookie(langParam, lang, {
            path: '/',
            expires: 365 * 10
        });
    }

    function applyLang() {
        i18n.setLang(currentLang);
        angularLocale.setLocale(currentLang);
    }

    resolveLang();
    applyLang();

    return angular.module('np.l10n', [])
        //
        .factory('npL10n', ['$log', '$location', '$rootScope', function($log, $location, $rootScope){
            //
            _.extend($rootScope, i18n.translateFuncs);

            //
            $('body').addClass('lang-' + currentLang);

            // API
            return {
                l10n: function() {
                    return {
                        getLang: function() {
                            return currentLang;
                        },
                        currentUrlWithLang: function(lang) {
                            return urlWithLang($location.absUrl(), lang);
                        },
                        urlWithLang: urlWithLang
                    };
                }
            };
        }]);
    //
});
