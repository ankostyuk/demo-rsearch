/**
 * @module rsearch-navigation
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

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
                        query: null,
                        total: null,
                        activeResult: null,
                        byNodeTypes: {},
                        getTotalByNodeType: getTotalByNodeType,
                        showResult: showSearchResult
                    };

                    var byRelationsStore = {};

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

                    // utils
                    function setNodeList(object) {
                        object.nodeList = object.result.list ? object.result.list : [];
                    }

                    function pushNodeList(object, callback) {
                        if (object.result) {
                            _.each(object.result.list, function(node){
                                object.nodeList.push(node);
                            });
                            callback(noMore(object.result));
                        } else {
                            callback(true);
                        }
                    }

                    /*
                     * search
                     *
                     */
                    $rootScope.$on('np-rsearch-input-refresh', function(e, text){
                        doSearch(text);
                    });

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
                                nodeListProcess(data);
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

                                setNodeList(byNodeType);
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

                        nodeFormView.hide();

                        setSearchBreadcrumb(nodeType);

                        nodeListView.reset(byNodeType.nodeList, noMore(byNodeType.result), function(callback){
                            byNodeType.pageConfig.page++;

                            searchRequest(byNodeType);

                            byNodeType.request.promise['finally'](function(){
                                pushNodeList(byNodeType, callback);
                            });
                        });
                    }

                    /*
                     * node form
                     *
                     */
                    $rootScope.$on('np-rsearch-node-select', function(e, node){
                        showNodeForm(node, element);
                    });

                    function showNodeForm(node) {
                        nodeListView.clear();

                        nodeFormView.setNode(node);
                        nodeFormView.show(node);

                        pushNodeFormBreadcrumb(node);

                        npRsearchViews.scrollTop();
                    }

                    /*
                     * relations
                     *
                     */
                    $rootScope.$on('np-rsearch-node-relations-counts-count-click', function(e, node, direction, relationType){
                        showRelations(node, direction === 'in' ? 'parents' : 'children', relationType);
                    });

                    function relationsRequest(byRelations) {
                        byRelations.request = npRsearchResource.relations({
                            node: byRelations.node,
                            direction: byRelations.direction,
                            relationType: byRelations.relationType,
                            pageConfig: byRelations.pageConfig,
                            previousRequest: byRelations.request
                        });

                        byRelations.request.promise
                            .success(function(data, status){
                                nodeListProcess(data);
                                complete(data);
                            })
                            .error(function(data, status){
                                complete(null);
                            });

                        function complete(result) {
                            byRelations.result = result;
                        }
                    }

                    function showRelations(node, direction, relationType, key) {
                        nodeFormView.hide();

                        var index       = pushRelationsBreadcrumb(node, direction, relationType),
                            byRelations = byRelationsStore[key];

                        if (byRelations) {
                            resetNodeListView();
                        } else {
                            byRelations = byRelationsStore[index] = {
                                node: node,
                                direction: direction,
                                relationType: relationType,
                                pageConfig: {
                                    page: 1,
                                    pageSize: 20
                                },
                                request: null,
                                result: null,
                                nodeList: null
                            };

                            relationsRequest(byRelations);

                            byRelations.request.promise['finally'](function(){
                                setNodeList(byRelations);
                                resetNodeListView();
                            });
                        }

                        function resetNodeListView() {
                            nodeListView.reset(byRelations.nodeList, noMore(byRelations.result), function(callback){
                                byRelations.pageConfig.page++;

                                relationsRequest(byRelations);

                                byRelations.request.promise['finally'](function(){
                                    pushNodeList(byRelations, callback);
                                });
                            });
                        }
                    }

                    /*
                     * breadcrumbs
                     *
                     */
                    $rootScope.$on('np-rsearch-navigation-breadcrumb-go', function(e, breadcrumb){
                        goByBreadcrumb(breadcrumb);
                    });

                    function isBreadcrumbs() {
                        return scope.breadcrumbs.length > 1;
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

                        return index;
                    }

                    function pushNodeFormBreadcrumb(node) {
                        var index = _.size(scope.breadcrumbs);

                        scope.breadcrumbs[index] = {
                            index: index,
                            type: 'NODE_FORM',
                            data: {
                                node: node
                            }
                        };

                        return index;
                    }

                    function pushRelationsBreadcrumb(node, direction, relationType) {
                        var index = _.size(scope.breadcrumbs);

                        nodeFormView.hide();

                        scope.breadcrumbs[index] = {
                            index: index,
                            type: 'NODE_RELATIONS',
                            data: {
                                node: node,
                                direction: direction,
                                relationType: relationType
                            }
                        };

                        return index;
                    }

                    function goByBreadcrumb(breadcrumb) {
                        if (isLastBreadcrumb(breadcrumb)) {
                            return;
                        }

                        var index           = breadcrumb.index,
                            nextBreadcrumb  = scope.breadcrumbs[index + 1];

                        clearBreadcrumbs(index);

                        if (breadcrumb.type === 'SEARCH') {
                            showSearchResult(breadcrumb.data.nodeType);
                            highlightNodeInList();
                        } else
                        if (breadcrumb.type === 'NODE_FORM') {
                            showNodeForm(breadcrumb.data.node);
                        } else
                        if (breadcrumb.type === 'NODE_RELATIONS') {
                            showRelations(breadcrumb.data.node, breadcrumb.data.direction, breadcrumb.data.relationType, index);
                            highlightNodeInList();
                        }

                        function highlightNodeInList() {
                            if (nextBreadcrumb && nextBreadcrumb.type === 'NODE_FORM') {
                                // TODO Не прокручивать до ноды,
                                // а прокрутить до сохраненного положения прокрутки
                                // и выделить ноду?
                                nodeListView.scrollToNode(nextBreadcrumb.data.node);
                            }
                        }
                    }

                    function clearBreadcrumbs(toIndex) {
                        toIndex = toIndex || 0;

                        for (var i = toIndex + 1; i < _.size(scope.breadcrumbs); i++) {
                            delete byRelationsStore[i];
                        }

                        scope.breadcrumbs = scope.breadcrumbs.slice(0, toIndex);
                    }

                    function isLastBreadcrumb(breadcrumb) {
                        return breadcrumb.index === _.size(scope.breadcrumbs) - 1;
                    }


                    /*
                     * node
                     *
                     */
                    function nodeListProcess(data) {
                        _.each(data.list, function(node, i){
                            buildNodeExtraMeta(node);

                            // test
                            //node.__i = 1 + i + data.pageSize * (data.pageNumber - 1);
                        });
                    }

                    function buildNodeExtraMeta(node) {
                        // компания
                        if (node._type === 'COMPANY') {
                            // юридическое состояние
                            var egrulState  = node.egrul_state,
                                aliveCode   = 5, // Действующее
                                _liquidate;

                            if (egrulState && egrulState.code != aliveCode) {
                                _liquidate = {
                                    state: {
                                        _actual: egrulState._actual,
                                        _since: egrulState._since,
                                        type: egrulState.type
                                    }
                                };
                            } else
                            if (node.dead_dt) {
                                _liquidate = {
                                    state: {
                                        _actual: null,
                                        _since: node.dead_dt,
                                        type: 'Ликвидировано' // TODO l10n
                                    }
                                };
                            }

                            node._liquidate = _liquidate;
                        }
                    }
                }]
            };
        }]);
    //
});
