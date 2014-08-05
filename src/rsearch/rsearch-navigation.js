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
        .directive('npRsearchNavigation', ['$log', '$interpolate', '$q', '$timeout', '$rootScope', '$window', 'npRsearchViews', 'npRsearchMetaHelper', 'npRsearchResource', 'npRsearchUser', 'npRsearchConfig', function($log, $interpolate, $q, $timeout, $rootScope, $window, npRsearchViews, npRsearchMetaHelper, npRsearchResource, npRsearchUser, npRsearchConfig){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                link: function(scope, element, attrs) {
                    //
                    var viewsElement    = element.find('.views'),
                        nodeListView    = npRsearchViews.createNodeListView(viewsElement, scope),
                        nodeFormView    = npRsearchViews.createNodeFormView(viewsElement, scope);

                    /*
                     * init
                     *
                     */
                    var init                    = false,
                        user                    = npRsearchUser.user(),
                        userPromise             = fetchUser(),
                        initMetaDefer           = $q.defer(),
                        initMetaPromise         = initMetaDefer.promise,
                        initPromise             = $q.all([initMetaPromise, userPromise]),
                        initDeferredFunctions   = [];

                    $q.all(initPromise).then(initSuccess);

                    function initSuccess() {
                        var me = this;

                        init = true;

                        _.each(initDeferredFunctions, function(f){
                            f.func.apply(me, f.args);
                        });
                    }

                    function functionAfterInit(func, args) {
                        var me = this;

                        if (init) {
                            func.apply(me, args);
                        } else {
                            initDeferredFunctions.push({
                                func: func,
                                args: args
                            });
                        }
                    }

                    // user
                    function fetchUser() {
                        return npRsearchUser.fetchUser().completePromise;
                    }

                    //
                    $rootScope.$on('np-rsearch-meta-ready', initByMeta);

                    function initByMeta() {
                        search.byNodeTypes = {};

                        _.each(npRsearchMetaHelper.getNodeTypes(), function(data, nodeType){
                            search.byNodeTypes[nodeType] = {
                                  nodeType: nodeType,
                                  resultPriority: data.searchResultPriority,
                                  pageConfig: null,
                                  request: null,
                                  result: null,
                                  nodeList: null
                              };
                        });

                        initMetaDefer.resolve();
                    }

                    /*
                     * utils
                     *
                     */
                    function resetPageConfig() {
                        return {
                            page: 1,
                            pageSize: 20
                        };
                    }

                    function noMore(result) {
                        return result ? result.pageNumber >= result.pageCount : null;
                    }

                    function setNodeList(object) {
                        object.nodeList = object.result && object.result.list ? object.result.list : [];
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
                    var search = {
                        query: null,
                        total: null,
                        activeResult: null,
                        byNodeTypes: null,
                        isEmptyResult: isEmptySearchResult,
                        getTotalByNodeType: getSearchTotalByNodeType,
                        showResult: showSearchResult
                    };

                    $rootScope.$on('np-rsearch-input-refresh', function(e, text){
                        functionAfterInit(doSearch, [text]);
                    });

                    function doSearch(query) {
                        search.query = query;

                        nodeFormView.hide();
                        clearBreadcrumbs();
                        hideRelationsFilters();

                        if (_.isBlank(search.query)) {
                            reset();
                            return;
                        }

                        var searchPromises = [];

                        loading(function(done){
                            _.each(search.byNodeTypes, function(byNodeType){
                                byNodeType.pageConfig = resetPageConfig();
                                byNodeType.nodeList = null;
                                searchRequest(byNodeType);
                                searchPromises.push(byNodeType.request.completePromise);
                            });

                            // ! При конструкции ['finally'](...) - генерятся исключения, но не отображаются в консоли
                            $q.all(searchPromises).then(complete, complete);

                            function complete() {
                                checkSearchResult();
                                done();
                            }
                        });
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

                                byNodeType.total = result.total;
                            } else {
                                byNodeType.total = null;
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

                    function getSearchTotalByNodeType(nodeType) {
                        return (search.byNodeTypes && search.byNodeTypes[nodeType].total) || null;
                    }

                    function showSearchResult(nodeType) {
                        var byNodeType = search.byNodeTypes[nodeType];

                        setSearchResult(nodeType);

                        nodeFormView.hide();
                        hideRelationsFilters();

                        nodeListView.showItemNumber(false);

                        nodeListView.reset(byNodeType.nodeList, noMore(byNodeType.result), function(callback){
                            loading(function(done){
                                byNodeType.pageConfig.page++;

                                searchRequest(byNodeType);

                                // ! При конструкции ['finally'](...) - генерятся исключения, но не отображаются в консоли
                                byNodeType.request.promise.then(complete, complete);

                                function complete() {
                                    pushNodeList(byNodeType, callback);
                                    done();
                                }
                            });
                        });
                    }

                    function setSearchResult(nodeType) {
                        search.activeResult = nodeType;
                        setSearchBreadcrumb(nodeType);
                    }

                    function isEmptySearchResult() {
                        return search.total === 0;
                    }

                    /*
                     * node form
                     *
                     */
                    var nodeForm = {
                        egrulRequest: null
                    };

                    $rootScope.$on('np-rsearch-node-select', function(e, node){
                        showNodeForm(node);
                    });

                    function showNodeForm(node) {
                        loading(function(done){
                            var nodePromises = [];

                            // egrul list // TODO no PHP API - ответ презаписывает тикет и слетает аутентификация
                            if (node._type === 'COMPANY') {
                                var egrulRequest = nodeForm.egrulRequest = npRsearchResource.egrulList({
                                    node: node,
                                    previousRequest: nodeForm.egrulRequest,
                                    success: function(data, status){
                                        node.__egrulList = data;
                                    },
                                    error: function(data, status){
                                        node.__egrulList = [];
                                    }
                                });

                                nodePromises.push(egrulRequest.completePromise);
                            }

                            // user limits
                            //
                            // TODO возможно, надо будет убрать,
                            // если обновление лимитов будет в другом месте -- при заказе продуктов
                            nodePromises.push(fetchUser());

                            // ! При конструкции ['finally'](...) - генерятся исключения, но не отображаются в консоли
                            $q.all(nodePromises).then(complete, complete);

                            function complete() {
                                nodeListView.clear();
                                hideRelationsFilters();

                                nodeFormView.setNode(node);
                                nodeFormView.show(node);

                                pushNodeFormBreadcrumb(node);

                                npRsearchViews.scrollTop();

                                done();
                            }
                        });
                    }

                    /*
                     * relations
                     *
                     */
                    var byRelationsStore = {};

                    $rootScope.$on('np-rsearch-node-form-relations-click', function(e, node, direction, relationType){
                        if (user.isProductAvailable('relations_find_related')) {
                            showRelations(node, direction, relationType);
                        } else {
                            showProductInfo('relations_find_related');
                        }
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
                                pageConfig: null,
                                request: null,
                                result: null,
                                nodeList: null
                            };

                            doRelations(byRelations, true);
                        }
                    }

                    function doRelations(byRelations, checkAccentedResult) {
                        loading(function(done){
                            byRelations.pageConfig = resetPageConfig();

                            relationsRequest(byRelations);

                            // ! При конструкции ['finally'](...) - генерятся исключения, но не отображаются в консоли
                            byRelations.request.promise.then(complete, complete);

                            function complete() {
                                setNodeList(byRelations);

                                var accentedResult = checkAccentedResult && checkAccentedResultByRelations(byRelations);

                                if (!accentedResult) {
                                    resetRelationsNodeListView(byRelations);
                                }

                                done();
                            }
                        });
                    }

                    function resetRelationsNodeListView(byRelations) {
                        nodeListView.showItemNumber(byRelations.result && byRelations.result.total > 1);

                        nodeListView.reset(byRelations.nodeList, noMore(byRelations.result), function(callback){
                            loading(function(done){
                                byRelations.pageConfig.page++;

                                relationsRequest(byRelations);

                                // ! При конструкции ['finally'](...) - генерятся исключения, но не отображаются в консоли
                                byRelations.request.promise.then(complete, complete);

                                function complete() {
                                    pushNodeList(byRelations, callback);
                                    done();
                                }
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
                        if (!byRelations.result) {
                            return null;
                        }

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
                        $rootScope.$emit('np-rsearch-filters-toggle-inn-filter', false);
                    }

                    function initRelationsFilters(byRelations) {
                        if (!byRelations.result) {
                            return;
                        }

                        var filters = byRelations.filters;

                        if (!filters) {
                            var total = byRelations.result.total;

                            var regionFilter = {
                                values: byRelations.result.info.nodeFacet && byRelations.result.info.nodeFacet.region_code,
                                value: null,
                                total: total,
                                callback: function(value){
                                    regionFilter.value = value;
                                    regionFilter.condition = {
                                        'node.region_code.equals': value
                                    };
                                    doRelations(byRelations, false);
                                }
                            };

                            var innFilter = {
                                values: byRelations.result.info.relFacet && byRelations.result.info.relFacet.inn,
                                value: null,
                                total: total,
                                callback: function(value){
                                    innFilter.value = value;
                                    innFilter.condition = {};
                                    if (value === false) {
                                        innFilter.condition['rel.inn.exists'] = value;
                                    } else if (value) {
                                        innFilter.condition['rel.inn.equals'] = value;
                                    }
                                    doRelations(byRelations, false);
                                }
                            };

                            filters = {
                                region: regionFilter,
                                inn: innFilter
                            };

                            byRelations.filters = filters;
                        }

                        if (filters.region.values) {
                            $rootScope.$emit('np-rsearch-filters-set-region-filter-data', filters.region);
                            $rootScope.$emit('np-rsearch-filters-toggle-region-filter', true);
                        }

                        if (filters.inn.values) {
                            $rootScope.$emit('np-rsearch-filters-set-inn-filter-data', filters.inn);
                            $rootScope.$emit('np-rsearch-filters-toggle-inn-filter', true);
                        }
                    }

                    /*
                     * loading
                     *
                     */
                    var loadingShowDelay = 500,
                        loadingId;

                    function loading(operation) {
                        loadingId = _.uniqueId();

                        process(loadingId, operation);

                        function process(id, operation) {
                            var complete = false;

                            $timeout(function(){
                                if (!complete && id === loadingId) {
                                    element.addClass('loading');
                                }
                            }, loadingShowDelay);

                            operation(done);

                            function done() {
                                $timeout(function(){
                                    if (id === loadingId) {
                                        element.removeClass('loading');
                                        complete = true;
                                    }
                                });
                            }
                        }
                    }

                    /*
                     * products
                     *
                     */
                    var productConfig = npRsearchConfig.product || {};

                    $rootScope.$on('np-rsearch-node-form-product-click', function(e, productName, node){
                        if (user.isProductAvailable(productName)) {
                            purchaseProduct(productName, {
                                node: node
                            });
                        } else {
                            showProductInfo(productName);
                        }
                    });

                    function showProductInfo(productName, context) {
                        var url = $interpolate(productConfig[productName]['info.url'])(context);

                        $window.open(url, '_blank');
                    }

                    function purchaseProduct(productName, context) {
                        var url = $interpolate(productConfig[productName]['purchase.url'])(context);

                        $window.open(url, '_blank');
                    }

                    /*
                     * scope
                     *
                     */
                    _.extend(scope, {
                        search: search,
                        breadcrumbs: [],
                        isBreadcrumbs: isBreadcrumbs
                    });

                    function reset() {
                        search.total = null;

                        _.each(search.byNodeTypes, function(byNodeType, nodeType){
                            byNodeType.request.abort();
                            byNodeType.total = null;
                        });

                        nodeListView.clear();
                    }
                }
            };
        }]);
    //
});
