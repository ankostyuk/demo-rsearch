/**
 * @module rsearch
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';
    var angular           = require('angular');

    var submodules = {
        rsearchInput:       require('./rsearch-input'),
        rsearchNavigation:  require('./rsearch-navigation'),
        rsearchFilters:     require('./rsearch-filters'),
        rsearchViews:       require('./rsearch-views'),
        rsearchAutokad:     require('./rsearch-autokad'),
        rsearchFnsRegDocs:  require('./rsearch-fns-reg-docs'),
        rsearchResource:    require('./rsearch-resource'),
        rsearchMeta:        require('./rsearch-meta')
    };

    return angular.module('np.rsearch', _.pluck(submodules, 'name'));
});
