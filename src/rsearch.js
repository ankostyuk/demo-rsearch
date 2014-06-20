/**
 * @module rsearch
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('less!./styles/rsearch');
    var template        = require('text!./views/rsearch.html');

                          require('jquery');
                          require('underscore');
    var i18n            = require('i18n'),
        angular         = require('angular');

    var submodules = {
        rsearchInput:       require('./rsearch-input'),
        rsearchNavigation:  require('./rsearch-navigation'),
        rsearchViews:       require('./rsearch-views'),
        rsearchResource:    require('./rsearch-resource'),
        rsearchMeta:        require('./rsearch-meta')
    };

    return angular.module('np.rsearch', _.pluck(submodules, 'name'))
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('npRsearch', ['$log', '$q', 'npRsearchResource', 'npRsearchMetaHelper', function($log, $q, npRsearchResource, npRsearchMetaHelper){
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
                    var byNodeTypes = {},
                        bySearchResultPriority = {};

                    _.each(npRsearchMetaHelper.getNodeTypes(), function(nodeType, key){
                        byNodeTypes[key] = {
                            searchRequest: null,
                            searchResult: null,
                            searchResultPriority: nodeType.searchResultPriority
                        };

                        bySearchResultPriority[nodeType.searchResultPriority] = key;
                    });

                    //
                    scope.$on('np.rsearch-input.refresh', function(e, text){
                        search(text);
                    });

                    function search(query) {
                        element.addClass('search-request');

                        var requestPromises = [];

                        _.each(byNodeTypes, function(byNodeType, key){
                            byNodeType.searchResult = null;

                            if (byNodeType.searchRequest) {
                                byNodeType.searchRequest.canceler.resolve();
                            }

                            if (!query) {
                                return;
                            }

                            var request = byNodeType.searchRequest = npRsearchResource.search({
                                q: query,
                                nodeType: key
                            });

                            request.promise
                                .success(function(data, status){
                                    byNodeType.searchResult = data;
                                });

                            requestPromises.push(request.promise);
                        });

                        $q.all(requestPromises)['finally'](function(){
                            searchResult(query);
                        });
                    }

                    function searchResult(query) {
                        var result = {
                            byNodeTypes: {},
                            isEmpty: true,
                            query: query,
                            preferredResult: null
                        };

                        var searchResultPriority = 0;

                        _.each(byNodeTypes, function(byNodeType, key){
                            result.byNodeTypes[key] = byNodeType.searchResult;
                            if (byNodeType.searchResult && byNodeType.searchResult.total) {
                                result.isEmpty = false;
                                searchResultPriority = Math.max(searchResultPriority, byNodeType.searchResultPriority);
                            }
                        });

                        result.preferredResult = bySearchResultPriority[searchResultPriority];

                        scope.$broadcast('np.rsearch.search-result', result);

                        element.removeClass('search-request');
                    }

                    //
                    search('налпоинтер');
                }]
            };
        }]);
    //
});
