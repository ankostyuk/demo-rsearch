//
define(function(require) {'use strict';
    var root = window;

    var angular         = require('angular'),
        i18n            = require('i18n'),
        bundleContent   = require('text!./bundle.json'),
        bundleJSON      = angular.fromJson(bundleContent),
        angularLocale   = require('./angular-locale');

    i18n.setConfig(root._RESOURCES_CONFIG['config']['i18n']);
    i18n.setBundle(bundleJSON);
    i18n.setLang(root._APP_CONFIG.lang);
    angularLocale.setLocale(root._APP_CONFIG.lang);

    return {};
});
