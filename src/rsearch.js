/**
 * @module rsearch
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('less!./styles/rsearch');
    var template        = require('text!./views/rsearch.html');

                          require('underscore');
    var i18n            = require('i18n'),
        angular         = require('angular');

    var submodules = {
        rsearchInput:     require('./rsearch-input'),
        rsearchResource:  require('./rsearch-resource'),
        rsearchMeta:      require('./rsearch-meta')
    };

    return angular.module('np.rsearch', _.pluck(submodules, 'name'))
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('npRsearch', ['$log', 'npRsearchResource', function($log, npRsearchResource){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                    //
                    var scope   = $scope,
                        element = $element,
                        attrs   = $attrs;

                    var searchRequest;

                    scope.$on('np.rsearch-input.refresh', function(e, text){
                        $log.info('np.rsearch-input.refresh', text);

                        searchRequest = npRsearchResource.search({
                            q: text,
                            previousRequest: searchRequest
                        });

                        searchRequest.promise
                            .success(function(data, status){
                                $log.info('search success', data, status);
                            })
                            .error(function(data, status){
                                $log.warn('search error', data, status);
                            })
                            ['finally'](function(){
                                $log.log('search finally');
                            });
                    });
                }]
            };
        }]);
    //
});
