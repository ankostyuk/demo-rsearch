/**
 * @module rsearch
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('less!./styles/rsearch-input');
    var template        = require('text!./views/rsearch-input.html');

    var angular         = require('angular');

    return angular.module('np.rsearch-input', [])
        //
        .directive('npRsearchInput', ['$log', function($log){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                    $log.info('npRsearchInput');
                }]
            };
        }]);
    //
});
