//
define(function(require) {'use strict';
    var root = window;

    var angular         = require('angular'),
        i18n            = require('i18n'),
        angularLocale   = require('./angular-locale');

    var uiBundle        = angular.fromJson(require('text!./ui/bundle.json')),
        regionBundle    = angular.fromJson(require('text!./okato_region/bundle.json'));

    i18n.setConfig(root._RESOURCES_CONFIG['config']['i18n']);
    i18n.setBundle([uiBundle, regionBundle]);
    i18n.setLang(root._APP_CONFIG.lang);
    angularLocale.setLocale(root._APP_CONFIG.lang);

    return {};
});
