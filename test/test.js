/**
 * @module test
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    var angular         = require('angular');

    var purl            = require('purl'),
        locationSearch  = purl().param(),
        xxx             = locationSearch['xxx'] === 'true';

    // console.info('xxx:', xxx);

    var angularModules = [
        // require('./data-mocks'),
        require('./relations-actuality-algo-test')
    ];

    //
    return angular.module('test', _.pluck(angularModules, 'name'))
        //
        .constant('testConfig', {
        })
        //
        .run(['$log', 'relationsActualityAlgoTest', function($log, relationsActualityAlgoTest){
            $log.info('Run tests...');

            //
            relationsActualityAlgoTest.testXXX();
        }]);
    //
});
