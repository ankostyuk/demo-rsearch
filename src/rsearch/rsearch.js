/**
 * @module rsearch
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';
    var angular           = require('angular');

    var submodules = [
        require('./rsearch-input'),
        require('./rsearch-navigation'),
        require('./rsearch-filters'),
        require('./rsearch-views'),
        require('./rsearch-autokad'),
        require('./rsearch-fedresurs-bankruptcy'),
        require('./rsearch-fns-reg-docs'),
        require('./rsearch-purchase-dishonest-supplier'),
        require('./rsearch-resource'),
        require('./rsearch-meta'),
        require('nullpointer-connections-ui/connections/lists/resource')
    ];

    return angular.module('np.rsearch', _.pluck(submodules, 'name'));
});
