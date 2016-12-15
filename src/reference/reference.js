/**
 * @module nkb.reference
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var angular           = require('angular');

    var submodules = [
        require('./sub-federal-unit')
    ];

    return angular.module('nkb.reference', _.pluck(submodules, 'name'));
    //
});
