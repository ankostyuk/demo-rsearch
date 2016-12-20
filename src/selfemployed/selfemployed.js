/**
 * @module nkb.selfemployed
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var angular           = require('angular');

    var submodules = [
        require('./helper')
    ];

    return angular.module('nkb.selfemployed', _.pluck(submodules, 'name'));
    //
});
