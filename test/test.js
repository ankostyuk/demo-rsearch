/**
 * @module test
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    var angular         = require('angular');

    var purl            = require('purl'),
        locationSearch  = purl().param(),
        testEnabled     = locationSearch['test'] === 'true';

    if (!testEnabled) {
        return angular.module('test', []);
    }

    console.info('test enabled');

    var angularModules = [
        require('./data-mocks')
    ];

    //
    return angular.module('test', _.pluck(angularModules, 'name'))
        //
        .constant('testConfig', {
        });
    //
});
