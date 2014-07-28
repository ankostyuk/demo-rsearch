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
                link: function(scope, element, attrs) {
                    //
                    var viewsElement    = element.find('.views'),
                        nodeListView    = npRsearchViews.createNodeListView(viewsElement, scope),
                        nodeFormView    = npRsearchViews.createNodeFormView(viewsElement, scope);

                    //
                    var search = {
                        query: null,
                        total: null,
                        activeResult: null,
                        byNodeTypes: null,
                        getTotalByNodeType: getTotalByNodeType,
                        showResult: showSearchResult
                    };

                    var byRelationsStore = {};

                    //
                    _.extend(scope, {
                        search: search,
                        breadcrumbs: [],
                        isBreadcrumbs: isBreadcrumbs
                    });

                    //
                    $rootScope.$on('np-rsearch-meta-ready', initByMeta);

                    function initByMeta() {
                        search.byNodeTypes = {};

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
                    }

                    // utils
                    function noMore(result) {
                        return result ? result.pageNumber >= result.pageCount : null;
                    }

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

                        // TODO #23 Моргание результатов при наборе
                        nodeFormView.hide();
                        clearBreadcrumbs();
                        hideRelationsFilters();

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
                            previousRequest: byNodeType.request,
                            success: function(data, status){
                                complete(data);
                            },
                            error: function(data, status){
                                complete(null);
                            }
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
                            var accentedResult = checkAccentedResultBySearch(activeResult);

                            if (!accentedResult) {
                                showSearchResult(activeResult);
                            }
                        } else {
                            nodeListView.clear();
                        }
                    }

                    function getTotalByNodeType(nodeType) {
                        var result = search.byNodeTypes && search.byNodeTypes[nodeType].result;
                        return result ? result.total : null;
                    }

                    function showSearchResult(nodeType) {
                        var byNodeType = search.byNodeTypes[nodeType];

                        setSearchResult(nodeType);

                        nodeFormView.hide();
                        hideRelationsFilters();

                        nodeListView.showItemNumber(false);

                        nodeListView.reset(byNodeType.nodeList, noMore(byNodeType.result), function(callback){
                            byNodeType.pageConfig.page++;

                            searchRequest(byNodeType);

                            byNodeType.request.promise['finally'](function(){
                                pushNodeList(byNodeType, callback);
                            });
                        });
                    }

                    function setSearchResult(nodeType) {
                        search.activeResult = nodeType;
                        setSearchBreadcrumb(nodeType);
                    }

                    /*
                     * node form
                     *
                     */
                    $rootScope.$on('np-rsearch-node-select', function(e, node){
                        showNodeForm(node);
                    });

                    function showNodeForm(node) {
                        nodeListView.clear();
                        hideRelationsFilters();

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

                    $rootScope.$on('np-rsearch-node-form-relations-click', function(e, node, direction, relationType){
                        showRelations(node, direction, relationType);
                    });

                    function showRelations(node, direction, relationType, key) {
                        nodeFormView.hide();

                        var index       = pushRelationsBreadcrumb(node, direction, relationType),
                            byRelations = byRelationsStore[key];

                        if (byRelations) {
                            resetRelationsNodeListView(byRelations);
                        } else {
                            byRelations = byRelationsStore[index] = {
                                node: node,
                                direction: direction,
                                relationType: relationType,
                                relationMap: npRsearchMetaHelper.buildRelationMap(node),
                                pageConfig: {
                                    page: 1,
                                    pageSize: 20
                                },
                                request: null,
                                result: null,
                                nodeList: null
                            };

                            doRelations(byRelations);
                        }
                    }

                    function doRelations(byRelations) {
                        relationsRequest(byRelations);

                        byRelations.request.promise['finally'](function(){
                            setNodeList(byRelations);

                            var accentedResult = checkAccentedResultByRelations(byRelations);

                            if (!accentedResult) {
                                resetRelationsNodeListView(byRelations);
                            }
                        });
                    }

                    function resetRelationsNodeListView(byRelations) {
                        nodeListView.showItemNumber(byRelations.result.total > 1);

                        nodeListView.reset(byRelations.nodeList, noMore(byRelations.result), function(callback){
                            byRelations.pageConfig.page++;

                            relationsRequest(byRelations);

                            byRelations.request.promise['finally'](function(){
                                pushNodeList(byRelations, callback);
                            });
                        });

                        nodeListView.setTargetInfo(getLastTargetInfo());

                        initRelationsFilters(byRelations);
                    }

                    function relationsRequest(byRelations) {
                        var filter = {};

                        _.each(byRelations.filters, function(f){
                            _.extend(filter, f.condition);
                        });

                        byRelations.request = npRsearchResource.relations({
                            node: byRelations.node,
                            direction: byRelations.direction,
                            relationType: byRelations.relationType,
                            pageConfig: byRelations.pageConfig,
                            filter: filter,
                            previousRequest: byRelations.request,
                            success: function(data, status){
                                complete(data);
                            },
                            error: function(data, status){
                                complete(null);
                            }
                        });

                        function complete(result) {
                            byRelations.result = result;
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
                        return getBreadcrumbSize() > 1;
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
                        var index = getBreadcrumbSize();

                        scope.breadcrumbs[index] = {
                            index: index,
                            type: 'NODE_FORM',
                            data: {
                                node: node,
                                targetInfo: getLastTargetInfo()
                            }
                        };

                        return index;
                    }

                    function pushRelationsBreadcrumb(node, direction, relationType, filter) {
                        var index = getBreadcrumbSize();

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

                        for (var i = toIndex + 1; i < getBreadcrumbSize(); i++) {
                            delete byRelationsStore[i];
                        }

                        scope.breadcrumbs = scope.breadcrumbs.slice(0, toIndex);
                    }

                    function isLastBreadcrumb(breadcrumb) {
                        return breadcrumb.index === getBreadcrumbSize() - 1;
                    }

                    function getBreadcrumbSize() {
                        return _.size(scope.breadcrumbs);
                    }

                    //
                    function getLastTargetInfo() {
                        var byRelations = byRelationsStore[getBreadcrumbSize() - 1];

                        return byRelations ? {
                            node: byRelations.node,
                            relationInfo: {
                                direction: byRelations.direction,
                                relationType: byRelations.relationType,
                                relationMap: byRelations.relationMap
                            }
                        } : null;
                    }

                    /*
                     * accented result
                     *
                     */
                    function checkAccentedResultBySearch(activeResult) {
                        var node;

                        if (search.total === 1) {
                            node = search.byNodeTypes[activeResult].result.list[0];
                        } else if (search.byNodeTypes['INDIVIDUAL'].result.total === 1) {
                            var n = search.byNodeTypes['INDIVIDUAL'].result.list[0];
                            node = n.gender ? n : null;
                        }

                        if (!node) {
                            return false;
                        }

                        setSearchResult(node._type);
                        showNodeForm(node);

                        return true;
                    }

                    function checkAccentedResultByRelations(byRelations) {
                        if (byRelations.result.total !== 1) {
                            return false;
                        }

                        var node = byRelations.result.list[0];

                        showNodeForm(node);

                        return true;
                    }

                    /*
                     * filters
                     *
                     */
                    function hideRelationsFilters() {
                        $rootScope.$emit('np-rsearch-filters-toggle-region-filter', false);
                    }

                    function initRelationsFilters(byRelations) {
                        var filters = byRelations.filters;

                        if (!filters) {
                            var regionFilter = {
                                regionCodes: byRelations.result.info.nodeFacet && byRelations.result.info.nodeFacet.region_code,
                                value: null,
                                callback: function(value){
                                    regionFilter.value = value;
                                    regionFilter.condition = {
                                        'node.region_code.equals': value
                                    };
                                    doRelations(byRelations);
                                }
                            };

                            filters = {
                                region: regionFilter
                            };

                            byRelations.filters = filters;
                        }

                        if (filters.region.regionCodes) {
                            $rootScope.$emit('np-rsearch-filters-set-region-filter-data', filters.region);
                            $rootScope.$emit('np-rsearch-filters-toggle-region-filter', true);
                        }
                    }
                }
            };
        }]);
    //
});
