/**
 * @module test
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    var angular         = require('angular');

    // var purl            = require('purl'),
    //     locationSearch  = purl().param(),
    //     xxx             = locationSearch['xxx'] === 'true';
    //
    // console.info('xxx:', xxx);

    var angularModules = [
        // require('./data-mocks'),
        require('./test-utils'),
        require('./relation-history-test')
    ];

    //
    return angular.module('test', _.pluck(angularModules, 'name'))
        //
        .constant('testConfig', {
        })
        //
        .run(['$log', 'testUtils', 'relationHistoryTest', function($log, testUtils, relationHistoryTest){
            $log.info('Run tests...');

            //
            testUtils.nodesRelationsDump([
                // 'COMPANY.1641441',
                // 'COMPANY.8505253',
                // 'COMPANY.8708612',
            ]);

            //
            relationHistoryTest.test();
        }]);
    //
});
