/**
 * @module rsearch
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('less!./styles/rsearch');
    var template        = require('text!./views/rsearch.html');

                          require('underscore');
    var angular         = require('angular');

    var submodules = {
        rsearchInput:     require('./rsearch-input')
    };

    return angular.module('np.rsearch', _.pluck(submodules, 'name'))
        //
        .directive('npRsearch', ['$log', function($log){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                    $log.info('npRsearch');
                }]
            };
        }]);
    //
});
