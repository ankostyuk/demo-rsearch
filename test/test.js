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
                'COMPANY.1779737',
                'COMPANY.1779737.2',
                // 'COMPANY.1970578',
                // 'COMPANY.8443194',
                // 'COMPANY.8505253',
                // 'COMPANY.8708612',

                // 'INDIVIDUAL.ab54ffed94bed4c9d52f96bb3b44e78eb8959013',
            ]);

            //
            // relationHistoryTest.test();
        }]);
    //
});
