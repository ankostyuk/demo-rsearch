/**
 * @module rsearch-navigation
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('less!./styles/rsearch-navigation');
    var template        = require('text!./views/rsearch-navigation.html');

                          require('underscore');
    var i18n            = require('i18n'),
        angular         = require('angular');

    return angular.module('np.rsearch-navigation', [])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('npRsearchNavigation', ['$log', function($log){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                    //
                    var scope   = $scope,
                        element = $element,
                        attrs   = $attrs;

                    //
                    _.extend(scope, {
                        searchResult: null,
                        activeSearchResult: null
                    });

                    //
                    scope.$on('np.rsearch.search-result', function(e, result){
                        searchResult(result);
                    });

                    function searchResult(result) {
                        $log.info('result', result);
                        scope.searchResult = result;
                        scope.activeSearchResult = result.preferredResult;
                    }
                }]
            };
        }]);
    //
});
