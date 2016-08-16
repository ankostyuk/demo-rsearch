/**
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    //
    var angular         = require('angular');

    var angularModules = [
    ];

    //
    return angular.module('relations-actuality-algo-test', _.pluck(angularModules, 'name'))
        .factory('relationsActualityAlgoTest', ['$log', function($log){
            return {
                testXXX: function() {
                    $log.info('Run relationsActualityAlgoTest::testXXX...');
                }
            };
        }]);
    //
});
