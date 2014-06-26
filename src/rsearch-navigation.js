/**
 * @module rsearch-navigation
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('less!./styles/rsearch-navigation');
    var template        = require('text!./views/rsearch-navigation.html');

                          require('jquery');
                          require('underscore');
    var i18n            = require('i18n'),
        angular         = require('angular');

    return angular.module('np.rsearch-navigation', [])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('npRsearchNavigation', ['$log', '$q', '$timeout', '$rootScope', '$window', 'npRsearchViews', 'npRsearchMetaHelper', 'npRsearchResource', function($log, $q, $timeout, $rootScope, $window, npRsearchViews, npRsearchMetaHelper, npRsearchResource){
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
                    var viewsElement    = element.find('.views'),
                        nodeListView    = npRsearchViews.createNodeListView(viewsElement, scope),
                        nodeFormView    = npRsearchViews.createNodeFormView(viewsElement, scope);

                    //
                    var search = {
                        query: null, //'НКБ',//Костюк Андрей Григорьевич',
                        total: null,
                        activeResult: null,
                        byNodeTypes: {},
                        getTotalByNodeType: getTotalByNodeType,
                        showResult: showSearchResult
                    };

                    _.each(npRsearchMetaHelper.getNodeTypes(), function(data, nodeType){
                        search.byNodeTypes[nodeType] = {
                              nodeType: nodeType,
                              resultPriority: data.searchResultPriority,
                              pageConfig: {
                                  page: 0,
                                  pageSize: 20
                              },
                              request: null,
                              result: null,
                              nodeList: null
                          };
                    });

                    //
                    _.extend(scope, {
                        search: search,
                        breadcrumbs: [],
                        isBreadcrumbs: isBreadcrumbs
                    });

                    $rootScope.$on('np-rsearch-input-refresh', function(e, text){
                        doSearch(text);
                    });

                    /*
                     * search
                     *
                     */
                    function doSearch(query) {
                        search.query = query;
                        search.total = null;

                        clearBreadcrumbs();

                        if (_.isBlank(search.query)) {
                            return;
                        }

                        var searchPromises = [];

                        _.each(search.byNodeTypes, function(byNodeType){
                            byNodeType.pageConfig.page = 1;
                            byNodeType.nodeList = null;
                            searchRequest(byNodeType);
                            searchPromises.push(byNodeType.request.promise);
                        });

                        $q.all(searchPromises)['finally'](checkSearchResult);
                    }

                    function searchRequest(byNodeType) {
                        byNodeType.request = npRsearchResource.search({
                            q: search.query,
                            nodeType: byNodeType.nodeType,
                            pageConfig: byNodeType.pageConfig,
                            previousRequest: byNodeType.request
                        });

                        byNodeType.request.promise
                            .success(function(data, status){
                                _.each(data.list, function(node, i){
                                    node.__i = 1 + i + data.pageSize * (data.pageNumber - 1);
                                });

                                complete(data);
                            })
                            .error(function(data, status){
                                complete(null);
                            });

                        function complete(result) {
                            byNodeType.result = result;
                        }
                    }

                    function checkSearchResult() {
                        var resultPriority  = 0,
                            activeResult;

                        search.total = 0;

                        _.each(search.byNodeTypes, function(byNodeType, nodeType){
                            var result = byNodeType.result;

                            if (result) {
                                search.total += result.total;

                                if (result.total && byNodeType.resultPriority > resultPriority) {
                                    resultPriority = byNodeType.resultPriority;
                                    activeResult = nodeType;
                                }

                                byNodeType.nodeList = result.list ? result.list : [];
                            }
                        });

                        if (activeResult) {
                            showSearchResult(activeResult);
                        } else {
                            nodeListView.clear();
                        }
                    }

                    function getTotalByNodeType(nodeType) {
                        var result = search.byNodeTypes[nodeType].result;
                        return result ? result.total : null;
                    }

                    function noMore(result) {
                        return result ? result.pageNumber >= result.pageCount : null;
                    }

                    function showSearchResult(nodeType) {
                        var byNodeType = search.byNodeTypes[nodeType];

                        search.activeResult = nodeType;

                        setSearchBreadcrumb(nodeType);

                        nodeListView.reset(byNodeType.nodeList, noMore(byNodeType.result), function(callback){
                            byNodeType.pageConfig.page++;

                            searchRequest(byNodeType);

                            byNodeType.request.promise['finally'](function(){
                                _.each(byNodeType.result.list, function(node){
                                    byNodeType.nodeList.push(node);
                                });
                                callback(noMore(byNodeType.result));
                            });
                        });
                    }

                    /*
                     * breadcrumbs
                     *
                     */
                    $rootScope.$on('np-rsearch-node-select', function(e, node){
                        setNodeFormBreadcrumb(node, element);
                    });

                    $rootScope.$on('np-rsearch-navigation-breadcrumb-go', function(e, breadcrumb){
                        goByBreadcrumb(breadcrumb);
                    });

                    function isBreadcrumbs() {
                        return scope.breadcrumbs.length > 1;
                    }

                    function setNodeFormBreadcrumb(node) {
                        nodeFormView.setNode(node);
                        nodeFormView.show(node);
                        pushNodeFormBreadcrumb(node);
                    }

                    function setSearchBreadcrumb(nodeType) {
                        clearBreadcrumbs();

                        var index = 0;

                        scope.breadcrumbs[index] = {
                            index: index,
                            type: 'SEARCH',
                            data: {
                                nodeType: nodeType
                            }
                        };
                    }

                    function pushNodeFormBreadcrumb(node) {
                        var index = _.size(scope.breadcrumbs);

                        if (index === 1) {
                            nodeListView.clear();
                        }

                        scope.breadcrumbs[index] = {
                            index: index,
                            type: 'NODE_FORM',
                            data: {
                                node: node
                            }
                        };
                    }

                    function goByBreadcrumb(breadcrumb) {
                        $log.info('goByBreadcrumb', breadcrumb);

                        var index           = breadcrumb.index + 1,
                            nextBreadcrumb  = scope.breadcrumbs[index];

                        clearBreadcrumbs(index);

                        if (breadcrumb.type === 'SEARCH') {
                            showSearchResult(breadcrumb.data.nodeType);

                            if (nextBreadcrumb && nextBreadcrumb.type === 'NODE_FORM') {
                                // TODO Не прокручивать до ноды,
                                // а прокрутить до сохраненного положения прокрутки
                                // и выделить ноду?
                                nodeListView.scrollToNode(nextBreadcrumb.data.node);
                            }
                        }
                    }

                    function clearBreadcrumbs(fromIndex) {
                        $log.info('clearBreadcrumbs', fromIndex);

                        nodeFormView.hide();

                        scope.breadcrumbs = scope.breadcrumbs.slice(0, fromIndex || 0);
                    }

                    //
                    $timeout(function(){
                        doSearch('1');
                    });
                }]
            };
        }]);
    //
});
