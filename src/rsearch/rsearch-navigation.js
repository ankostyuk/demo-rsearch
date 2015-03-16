/**
 * @module rsearch-navigation
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var template        = require('text!./views/rsearch-navigation.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular');

                          require('nkb.user');

    return angular.module('np.rsearch-navigation', ['nkb.user'])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .factory('npRsearchNavigationHelper', ['$log', function($log){
            //
            var navigationProxy = {
                //
                getScrollContainer: function() {
                    return null;
                },
                //
                resetNodeList: function(nodeListView) {
                },
                //
                showNodeList: function(nodeList, addNodeList, nodeListView) {
                },
                //
                nodeHeaderClick: function(info) {
                    return false;
                },
                //
                nodeClick: function(info) {
                    return true;
                }
            };

            // API
            return {
                getNavigationProxy: function() {
                    return navigationProxy;
                },

                setNavigationProxy: function(proxy) {
                    navigationProxy = proxy;
                }
            };
        }])
        //
        .directive('npRsearchNavigation', ['$log', '$interpolate', '$q', '$timeout', '$rootScope', '$window', 'npRsearchViews', 'npRsearchMetaHelper', 'npRsearchResource', 'nkbUser', 'appConfig', 'npL10n', 'NpRsearchAutokad', 'npRsearchAutokadConfig', 'npRsearchNavigationHelper', function($log, $interpolate, $q, $timeout, $rootScope, $window, npRsearchViews, npRsearchMetaHelper, npRsearchResource, nkbUser, appConfig, npL10n, NpRsearchAutokad, npRsearchAutokadConfig, npRsearchNavigationHelper){
            return {
                restrict: 'A',
                template: template,
                scope: {
                    npRsearchNavigationBrowserHistory: '='
                },
                link: function(scope, element, attrs) {
                    //
                    var navigationProxy = npRsearchNavigationHelper.getNavigationProxy();

                    //
                    var windowElement   = angular.element($window),
                        viewsElement    = element.find('.views'),
                        nodeListView    = npRsearchViews.createNodeListView(viewsElement, scope, navigationProxy),
                        nodeFormView    = npRsearchViews.createNodeFormView(viewsElement, scope),
                        browserHistory  = _.isBoolean(scope.npRsearchNavigationBrowserHistory) ? scope.npRsearchNavigationBrowserHistory : true;

                    var autokad = new NpRsearchAutokad();
                    nodeFormView.setAutokad(autokad);

                    /*
                     * init
                     *
                     */
                    var init                    = false,
                        l10n                    = npL10n.l10n(),
                        user                    = nkbUser.user(),
                        initPromise             = $q.all([npRsearchMetaHelper.initPromise()]),
                        initDeferredFunctions   = [];

                    function initSuccess() {
                        var me = this;

                        init = true;

                        initByMeta();

                        $rootScope.$emit('np-rsearch-navigation-init', scope);

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

                    function initByMeta() {
                        search.byNodeTypes = {};

                        _.each(npRsearchMetaHelper.getNodeTypes(), function(data, nodeType){
                            if (!data.search) {
                                return;
                            }

                            search.byNodeTypes[nodeType] = {
                                  nodeType: nodeType,
                                  resultPriority: data.searchResultPriority,
                                  pageConfig: null,
                                  filters: null,
                                  request: null,
                                  result: null,
                                  nodeList: null
                            };
                        });
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

                    function isEmptyResult(result) {
                        return result ? result.total === 0 : true;
                    }

                    function setNodeList(object) {
                        object.nodeList = object.result && object.result.list ? object.result.list : [];
                    }

                    function pushNodeList(object, callback) {
                        if (object.result) {
                            var pushNodeList = [];
                            _.each(object.result.list, function(node){
                                pushNodeList.push(node);
                                object.nodeList.push(node);
                            });
                            callback(noMore(object.result), pushNodeList);
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

                    $rootScope.$on('np-rsearch-input-refresh', function(e, text, initiator){
                        if (initiator !== history) {
                            functionAfterInit(doSearch, [text]);
                        }
                    });

                    function isSearch() {
                        return !_.isBlank(search.query);
                    }

                    function doSearch(query) {
                        search.query = query;

                        clearAutokad();
                        nodeFormView.hide();
                        clearBreadcrumbs();
                        clearNodeRelationsFilter();
                        hideSearchFilters();
                        hideRelationsFilters();
                        clearMessages();

                        if (isSearch()) {
                            $rootScope.$emit('np-rsearch-navigation-do-search', query);
                        } else {
                            $rootScope.$emit('np-rsearch-navigation-clear-search');
                            reset();
                            return;
                        }

                        var searchPromises = [];

                        loading(function(done){
                            _.each(search.byNodeTypes, function(byNodeType){
                                byNodeType.pageConfig = resetPageConfig();
                                byNodeType.filters = null;
                                byNodeType.nodeList = null;
                                searchRequest(byNodeType);
                                searchPromises.push(byNodeType.request.completePromise);
                            });

                            // ! При конструкции ['finally'](...) - генерятся исключения, но не отображаются в консоли
                            $q.all(searchPromises).then(complete, complete);

                            function complete() {
                                checkSearchResult(query);
                                done();
                            }
                        });
                    }

                    function doSearchByNodeType(byNodeType) {
                        loading(function(done){
                            byNodeType.pageConfig = resetPageConfig();
                            byNodeType.nodeList = null;
                            searchRequest(byNodeType);

                            byNodeType.request.completePromise.then(complete, complete);

                            function complete() {
                                setNodeList(byNodeType);
                                resetSearchNodeListView(byNodeType);
                                done();
                            }
                        });
                    }

                    function searchRequest(byNodeType) {
                        var filter = {};

                        _.each(byNodeType.filters, function(f){
                            _.extend(filter, f.condition);
                        });

                        byNodeType.request = npRsearchResource.search({
                            q: search.query,
                            nodeType: byNodeType.nodeType,
                            pageConfig: byNodeType.pageConfig,
                            filter: filter,
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

                    function checkSearchResult(query) {
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

                        $rootScope.$emit('np-rsearch-navigation-search-result', query, {
                            total: search.total
                        });
                    }

                    function getSearchTotalByNodeType(nodeType) {
                        return (search.byNodeTypes && search.byNodeTypes[nodeType].total) || null;
                    }

                    function showSearchResult(nodeType, breadcrumb) {
                        var byNodeType = search.byNodeTypes[nodeType];

                        setSearchResult(nodeType, breadcrumb);

                        clearAutokad();
                        nodeFormView.hide();
                        clearNodeRelationsFilter();
                        hideRelationsFilters();
                        clearMessages();

                        resetSearchNodeListView(byNodeType);
                    }

                    function resetSearchNodeListView(byNodeType) {
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

                        initSearchFilters(byNodeType);
                    }

                    function setSearchResult(nodeType, breadcrumb) {
                        search.activeResult = nodeType;
                        setSearchBreadcrumb(nodeType, breadcrumb);
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

                    $rootScope.$on('np-rsearch-node-header-click', function(e, info){
                        if (navigationProxy.nodeHeaderClick(info) !== false) {
                            showNodeForm('MINIREPORT', info.node);
                        }
                    });

                    $rootScope.$on('np-rsearch-node-click', function(e, info){
                        if (navigationProxy.nodeClick(info) !== false) {
                            showNodeForm('MINIREPORT', info.node);
                        }
                    });

                    function nodeFormEgrulList(node) {
                        if (node._type !== 'COMPANY') {
                            return $q.all();
                        }

                        if (!user.isAuthenticated()) {
                            node.__egrulList = [];
                            return $q.all();
                        }

                        nodeForm.egrulRequest = npRsearchResource.egrulList({
                            node: node,
                            previousRequest: nodeForm.egrulRequest,
                            success: function(data, status){
                                node.__egrulList = data;
                            },
                            error: function(data, status){
                                node.__egrulList = [];
                            }
                        });

                        return nodeForm.egrulRequest.completePromise;
                    }

                    function showNodeForm(formType, node, breadcrumb, noHistory, noSearchHistory) {
                        if (!noHistory && !noSearchHistory) {
                            checkSearchToHistory();
                        }

                        if (checkAccentedResultByNodeForm(formType, node, breadcrumb)) {
                            return;
                        }

                        loading(function(done){
                            // ! При конструкции ['finally'](...) - генерятся исключения, но не отображаются в консоли
                            nkbUser.fetchUser()
                                .then(egrulList, egrulList)
                                .then(complete, complete);

                            function egrulList() {
                                nodeFormEgrulList(node);
                            }

                            function complete() {
                                nodeListView.clear();
                                clearAutokad();
                                clearNodeRelationsFilter();
                                hideSearchFilters();
                                hideRelationsFilters();
                                clearMessages();

                                nodeFormView.setNode(node);
                                nodeFormView.setFormType(formType);
                                nodeFormView.show();

                                pushNodeFormBreadcrumb(formType, node, breadcrumb);

                                npRsearchViews.scrollTop();

                                if (!noHistory) {
                                    checkNodeFormToHistory();
                                }

                                showAutokad(formType, node);

                                $rootScope.$emit('np-rsearch-navigation-node-form', node);

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
                        relationsClick(node, direction, relationType);
                    });

                    function relationsClick(node, direction, relationType) {
                        if (user.isProductAvailable('relations_find_related')) {
                            showRelations(node, direction, relationType);
                        } else {
                            showProductInfo('relations_find_related');
                        }
                    }

                    function showRelations(node, direction, relationType, key, breadcrumb, noHistory) {
                        clearAutokad();
                        nodeFormView.hide();
                        setNodeRelationsFilter(node, direction, relationType);
                        hideSearchFilters();
                        hideRelationsFilters();
                        clearMessages();

                        var index       = pushRelationsBreadcrumb(node, direction, relationType, breadcrumb),
                            byRelations = byRelationsStore[key];

                        if (byRelations) {
                            resetRelationsNodeListView(byRelations);

                            if (!noHistory) {
                                checkNodeRelationsToHistory();
                            }
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

                            doRelations(byRelations, true, noHistory);
                        }

                        $rootScope.$emit('np-rsearch-navigation-node-relations', node, relationType);
                    }

                    function doRelations(byRelations, checkAccentedResult, noHistory) {
                        loading(function(done){
                            clearMessages();

                            byRelations.pageConfig = resetPageConfig();

                            relationsRequest(byRelations);

                            // ! При конструкции ['finally'](...) - генерятся исключения, но не отображаются в консоли
                            byRelations.request.promise.then(complete, complete);

                            function complete() {
                                setNodeList(byRelations);

                                var accentedResult = checkAccentedResult && checkAccentedResultByRelations(byRelations);

                                if (!accentedResult) {
                                    resetRelationsNodeListView(byRelations);

                                    if (!noHistory) {
                                        checkNodeRelationsToHistory();
                                    }
                                }

                                done();
                            }
                        });
                    }

                    function resetRelationsNodeListView(byRelations) {
                        if (isEmptyResult(byRelations.result)) {
                            showMessage('FILTERS_RESULT_EMPTY');
                        }

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
                    var breadcrumbs = {
                        list: []
                    };

                    $rootScope.$on('np-rsearch-navigation-breadcrumb-go', function(e, breadcrumb){
                        goByBreadcrumb(breadcrumb);
                    });

                    function isBreadcrumbs() {
                        return getBreadcrumbSize() > 1;
                    }

                    function setSearchBreadcrumb(nodeType, breadcrumb) {
                        if (breadcrumb) {
                            return breadcrumb.index;
                        }

                        var index = 0;

                        clearBreadcrumbs(index + 1);

                        breadcrumbs.list[index] = {
                            index: index,
                            type: 'SEARCH',
                            data: {
                                nodeType: nodeType
                            }
                        };

                        return index;
                    }

                    function pushNodeFormBreadcrumb(formType, node, breadcrumb) {
                        if (breadcrumb) {
                            return breadcrumb.index;
                        }

                        var index = getBreadcrumbSize();

                        breadcrumbs.list[index] = {
                            index: index,
                            type: 'NODE_FORM',
                            data: {
                                formType: formType,
                                node: node,
                                targetInfo: getLastTargetInfo()
                            }
                        };

                        return index;
                    }

                    function pushRelationsBreadcrumb(node, direction, relationType, breadcrumb) {
                        if (breadcrumb) {
                            return breadcrumb.index;
                        }

                        var index = getBreadcrumbSize();

                        breadcrumbs.list[index] = {
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
                            nextBreadcrumb  = breadcrumbs.list[index + 1];

                        clearBreadcrumbs(index + 1);

                        if (breadcrumb.type === 'SEARCH') {
                            showSearchResult(breadcrumb.data.nodeType, breadcrumb);
                            highlightNodeInListByBreadcrumb(nextBreadcrumb);
                        } else
                        if (breadcrumb.type === 'NODE_FORM') {
                            showNodeForm(breadcrumb.data.formType, breadcrumb.data.node, breadcrumb);
                        } else
                        if (breadcrumb.type === 'NODE_RELATIONS') {
                            showRelations(breadcrumb.data.node, breadcrumb.data.direction, breadcrumb.data.relationType, index, breadcrumb);
                            highlightNodeInListByBreadcrumb(nextBreadcrumb);
                        }
                    }

                    function clearBreadcrumbs(toIndex) {
                        toIndex = toIndex || 0;

                        for (var i = toIndex + 1; i < getBreadcrumbSize(); i++) {
                            delete byRelationsStore[i];
                        }

                        breadcrumbs.list = breadcrumbs.list.slice(0, toIndex);
                    }

                    function clearLastBreadcrumb() {
                        clearBreadcrumbs(getBreadcrumbSize() - 1);
                    }

                    function isLastBreadcrumb(breadcrumb) {
                        return breadcrumb.index === getBreadcrumbSize() - 1;
                    }

                    function getLastBreadcrumb() {
                        return breadcrumbs.list[getBreadcrumbSize() - 1];
                    }

                    function getBreadcrumbSize() {
                        return _.size(breadcrumbs.list);
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

                    function highlightNodeInListByBreadcrumb(breadcrumb) {
                        if (breadcrumb && breadcrumb.type === 'NODE_FORM') {
                            // TODO Не прокручивать до ноды,
                            // а прокрутить до сохраненного положения прокрутки
                            // и выделить ноду?
                            nodeListView.scrollToNode(breadcrumb.data.node);
                        }
                    }

                    /*
                     * accented result
                     *
                     */
                    function checkAccentedResultBySearch(activeResult) {
                        var individualResult = search.byNodeTypes['INDIVIDUAL'].result,
                            node;

                        if (search.total === 1) {
                            node = search.byNodeTypes[activeResult].result.list[0];
                        } else if (individualResult && individualResult.total === 1) {
                            var n = individualResult.list[0];
                            node = n.gender ? n : null;
                        }

                        if (!node) {
                            return false;
                        }

                        setSearchResult(node._type);
                        showNodeForm('MINIREPORT', node, null, false, true);

                        return true;
                    }

                    function checkAccentedResultByNodeForm(formType, node, breadcrumb) {
                        if (node._type === 'ADDRESS') {
                            pushNodeFormBreadcrumb(formType, node, breadcrumb);
                            showRelations(node, 'children', 'ADDRESS');
                            return true;
                        } else if (node._type === 'PHONE') {
                            pushNodeFormBreadcrumb(formType, node, breadcrumb);
                            showRelations(node, 'children', 'PHONE');
                            return true;
                        }

                        return false;
                    }

                    function checkAccentedResultByRelations(byRelations) {
                        if (!byRelations.result) {
                            return null;
                        }

                        if (byRelations.result.total !== 1) {
                            return false;
                        }

                        var node = byRelations.result.list[0];

                        showNodeForm('MINIREPORT', node);

                        return true;
                    }

                    /*
                     * filters
                     *
                     */
                    var searchRegionFilterScope = element.find('.search-filters [np-rsearch-region-filter]').isolateScope();

                    searchRegionFilterScope.toggle(true);

                    function hideSearchFilters() {
                        searchRegionFilterScope.toggle(false);
                    }

                    function initSearchFilters(byNodeType) {
                        if (!byNodeType.result) {
                            return;
                        }

                        var filters = byNodeType.filters;

                        if (!filters) {
                            var total = byNodeType.result.total;

                            var regionFilter = {
                                values: byNodeType.result.info.nodeFacet && byNodeType.result.info.nodeFacet.region_code,
                                value: null,
                                total: total,
                                callback: function(value){
                                    regionFilter.value = value;
                                    regionFilter.condition = {
                                        'region_code.equals': value
                                    };
                                    doSearchByNodeType(byNodeType);
                                }
                            };

                            filters = {
                                region: regionFilter
                            };

                            byNodeType.filters = filters;
                        }

                        if (filters.region.values) {
                            searchRegionFilterScope.setData(filters.region);
                            searchRegionFilterScope.toggle(true);
                        } else {
                            searchRegionFilterScope.toggle(false);
                        }
                    }

                    var nodeRelationsFilter = {
                        node: null,
                        autokad: autokad,
                        active: null,
                        relationsClick: function(direction, relationType) {
                            if (buildNodeRelationActiveKey(direction, relationType) === nodeRelationsFilter.active) {
                                return;
                            }

                            clearLastBreadcrumb();
                            relationsClick(nodeRelationsFilter.node, direction, relationType);
                        },
                        productClick: function(productName) {
                            doProduct(productName, nodeRelationsFilter.node);
                        },
                        getActiveRelation: function() {
                            var active = nodeRelationsFilter.active;

                            if (!active) {
                                return {};
                            }

                            var s = active.split('::');

                            return {
                                relationDirection: s[0],
                                relationType: s[1]
                            };
                        },
                        autokadClick: function() {
                            clearLastBreadcrumb();
                            doAutokad(nodeRelationsFilter.node);
                        }
                    };

                    function buildNodeRelationActiveKey(direction, relationType) {
                        return direction + '::' + relationType;
                    }

                    function setNodeRelationsFilter(node, direction, relationType) {
                        nodeRelationsFilter.node = node;
                        nodeRelationsFilter.active = buildNodeRelationActiveKey(direction, relationType);
                        autokad.setNode(node);
                    }

                    function clearNodeRelationsFilter() {
                        nodeRelationsFilter.node = null;
                        nodeRelationsFilter.active = null;
                    }

                    var relationsRegionFilterScope          = element.find('.relation-filters [np-rsearch-region-filter]').isolateScope(),
                        relationsInnFilterScope             = element.find('.relation-filters [np-rsearch-inn-filter]').isolateScope();

                    function hideRelationsFilters() {
                        relationsRegionFilterScope.toggle(false);
                        relationsInnFilterScope.toggle(false);
                        hideAffiliatedCauseFilters();
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
                                callback: function(value) {
                                    regionFilter.value = value;
                                    regionFilter.condition = {
                                        'node.region_code.equals': value
                                    };
                                    doRelations(byRelations, false, true);
                                }
                            };

                            var innFilter = {
                                values: byRelations.result.info.relFacet && byRelations.result.info.relFacet.inn,
                                value: null,
                                total: total,
                                callback: function(value) {
                                    innFilter.value = value;
                                    innFilter.condition = {};
                                    if (value === false) {
                                        innFilter.condition['rel.inn.exists'] = value;
                                    } else if (value) {
                                        innFilter.condition['rel.inn.equals'] = value;
                                    }
                                    doRelations(byRelations, false, true);
                                }
                            };

                            var affiliatedCauseFilter = {
                                values: byRelations.result.info.relFacet && byRelations.result.info.relFacet['causes.name'],
                                value: null,
                                total: total,
                                callback: function(value) {
                                    affiliatedCauseFilter.value = value;
                                    affiliatedCauseFilter.condition = {
                                        'rel.causes.name.equals': value
                                    };
                                    doRelations(byRelations, false, true);
                                }
                            };

                            filters = {
                                region: regionFilter,
                                inn: innFilter,
                                affiliatedCause: affiliatedCauseFilter
                            };

                            byRelations.filters = filters;
                        }

                        if (filters.region.values) {
                            relationsRegionFilterScope.setData(filters.region);
                            relationsRegionFilterScope.toggle(true);
                        }

                        if (filters.inn.values) {
                            relationsInnFilterScope.setData(filters.inn);
                            relationsInnFilterScope.toggle(true);
                        }

                        if (filters.affiliatedCause.values) {
                            $timeout(function(){
                                var affiliatedCauseFilterElement    = element.find('.right-bar [np-rsearch-node-relations] .active [np-rsearch-affiliated-cause-filter]'),
                                    affiliatedCauseFilterScope      = affiliatedCauseFilterElement.isolateScope();

                                hideAffiliatedCauseFilters();

                                affiliatedCauseFilterScope.setData(filters.affiliatedCause);
                                affiliatedCauseFilterScope.toggle(true);
                            });
                        }
                    }

                    function hideAffiliatedCauseFilters() {
                        element.find('.right-bar [np-rsearch-node-relations] [np-rsearch-affiliated-cause-filter]').each(function(el){
                            angular.element(this).isolateScope().toggle(false);
                        });
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
                    var productConfig = appConfig.product || {};

                    $rootScope.$on('np-rsearch-node-form-product-click', function(e, productName, node){
                        doProduct(productName, node);
                    });

                    function doProduct(productName, node) {
                        if (user.isProductAvailable(productName)) {
                            purchaseProduct(productName, getProductContext(productName, node));
                        } else {
                            showProductInfo(productName);
                        }
                    }

                    function showProductInfo(productName, context) {
                        var url = $interpolate(productConfig[productName]['info.url'])(context);

                        $window.open(url, '_blank');
                    }

                    function purchaseProduct(productName, context) {
                        var url = $interpolate(productConfig[productName]['purchase.url'])(context);

                        $window.open(url, '_blank');
                    }

                    function getProductContext(productName, node) {
                        var base = {
                            node: node,
                            lang: l10n.getLang()
                        };

                        var ext;

                        if (productName === 'relations_find_related') {
                            ext = nodeRelationsFilter.getActiveRelation();
                        }

                        return _.extend(base, ext);
                    }

                    /*
                     * messages
                     *
                     */
                    var messages = {
                        message: null
                    };

                    function showMessage(message) {
                        messages.message = message;
                    }

                    function clearMessages() {
                        messages.message = null;
                    }

                    /*
                     * browser history
                     *
                     */
                    var History = function() {
                        var windowHistory   = $window.history,
                            isHistory       = browserHistory && windowHistory && windowHistory.pushState,
                            // historyId -
                            // Для идентификации истории в контексте только данного приложения,
                            // если в браузерной истории есть состояния от предыдущего выполнения приложения,
                            // например, пользователь перезагрузил страницу, то данная история учитываться не будет.
                            // Это делается для того, чтобы исключить ошибки в работе истории при обновлении приложения.
                            // TODO Вместо appConfig.uuid, использовать идентификатор сборки приложения,
                            // т.к. в пределах одной сборки "старые истории" должны работать.
                            // TODO В случае игнорирования "старой истории" пользователь не видит изменений
                            // при манипуляциях с кнопками "вперед/назад" -- это плохо, нужно
                            // или извещать пользователя об этом, или чистить историю (не тривиально).
                            // Или забить на данный UX -- случаи когда пользователь перезагружает страницу редки,
                            // а когда пользователь долго работает с приложением,
                            // не закрывая страницу (и в это время приложение обновляется) еще более редки.
                            historyId       = appConfig.uuid,
                            historyList     = [];

                        windowElement.bind('popstate', function(e){
                            pop(e.originalEvent.state);
                        });

                        function isHistoryStateValid(state) {
                            return state && state.historyId === historyId;
                        }

                        function getHistorySize() {
                            return historyList.length;
                        }

                        function push(type) {
                            if (!isHistory) {
                                return;
                            }

                            var currentHistoryIndex = isHistoryStateValid(windowHistory.state) ? windowHistory.state.historyIndex : -1,
                                historyIndex        = currentHistoryIndex + 1;

                            var historyData = {
                                type: type,
                                searchQuery: search.query,
                                lastBreadcrumb: getLastBreadcrumb(),
                                breadcrumbs: copyBreadcrumbs(breadcrumbs),
                                byRelationsStore: copyRelationsStore(byRelationsStore)
                            };

                            var state = {
                                historyId: historyId,
                                historyIndex: historyIndex
                            };

                            if (getHistorySize() > historyIndex + 1) {
                                historyList = historyList.slice(0, historyIndex);
                            }

                            if (type === 'SEARCH') {
                                historyData.search = copySearch(search);
                            }

                            historyList[historyIndex] = historyData;
                            windowHistory.pushState(state, '');
                        }

                        function pop(state) {
                            if (!isHistory || !isHistoryStateValid(state)) {
                                return;
                            }

                            var historyData     = historyList[state.historyIndex],
                                breadcrumb      = historyData.lastBreadcrumb,
                                nextHistoryData = historyList[state.historyIndex + 1],
                                nextBreadcrumb  = nextHistoryData && nextHistoryData.lastBreadcrumb;


                            $rootScope.$emit('np-rsearch-input-set-text', historyData.searchQuery, history);

                            copyBreadcrumbs(historyData.breadcrumbs, breadcrumbs);
                            byRelationsStore = copyRelationsStore(historyData.byRelationsStore);

                            if (historyData.type === 'SEARCH') {
                                copySearch(historyData.search, search);
                                showSearchResult(breadcrumb.data.nodeType, breadcrumb);
                                highlightNodeInListByBreadcrumb(nextBreadcrumb);
                            } else
                            if (historyData.type === 'NODE_FORM') {
                                showNodeForm(breadcrumb.data.formType, breadcrumb.data.node, breadcrumb, true);
                            } else
                            if (historyData.type === 'NODE_RELATIONS') {
                                showRelations(breadcrumb.data.node, breadcrumb.data.direction, breadcrumb.data.relationType, breadcrumb.index, breadcrumb, true);
                                highlightNodeInListByBreadcrumb(nextBreadcrumb);
                            }

                            scope.$apply();
                        }

                        return {
                            push: push
                        };
                    };

                    var history = new History();

                    function checkSearchToHistory() {
                        var lastBreadcrumb = getLastBreadcrumb();

                        if (lastBreadcrumb.type === 'SEARCH') {
                            history.push('SEARCH');
                        }
                    }

                    function checkNodeFormToHistory() {
                        history.push('NODE_FORM');
                    }

                    function checkNodeRelationsToHistory() {
                        history.push('NODE_RELATIONS');
                    }

                    function copyBreadcrumbs(src, dst) {
                        dst = dst || {};

                        dst.list = _.clone(src.list);

                        return dst;
                    }

                    function copyRelationsStore(src) {
                        return _.clone(src);
                    }

                    function copySearch(src, dst) {
                        dst = dst || {};

                        dst.query           = src.query;
                        dst.total           = src.total;
                        dst.activeResult    = src.activeResult;

                        dst.byNodeTypes = dst.byNodeTypes || {};

                        _.each(src.byNodeTypes, function(srcByNodeType, nodeType){
                            var dstByNodeType = dst.byNodeTypes[nodeType] || (dst.byNodeTypes[nodeType] = {});

                            dstByNodeType.total         = srcByNodeType.total;
                            dstByNodeType.nodeList      = _.clone(srcByNodeType.nodeList);
                            dstByNodeType.pageConfig    = _.clone(srcByNodeType.pageConfig);
                            dstByNodeType.filters       = _.clone(srcByNodeType.filters);
                        });

                        return dst;
                    }

                    /*
                     * user
                     *
                     */
                    $rootScope.$on('nkb-user-apply', function(e){
                        var lastBreadcrumb = getLastBreadcrumb();

                        if (lastBreadcrumb && lastBreadcrumb.type === 'NODE_FORM') {
                            // Перезапросить список выписок ЕГРЮЛ
                            nodeFormEgrulList(lastBreadcrumb.data.node);
                        }
                    });

                    /*
                    * autokad
                    *
                    */
                    $rootScope.$on('np-rsearch-node-form-autokad-click', function(e, node){
                        doAutokad(node);
                    });

                    function showAutokad(formType, node) {
                        if (formType === 'MINIREPORT') {
                            autokad.setNode(node);
                        } else if (formType === 'AUTOKAD') {
                            autokad.showCases();
                        }
                    }

                    function clearAutokad() {
                        autokad.clear();
                    }

                    function doAutokad(node) {
                        showNodeForm('AUTOKAD', node);
                    }

                    /*
                     * scope
                     *
                     */
                    _.extend(scope, {
                        search: search,
                        isSearch: isSearch,
                        messages: messages,
                        breadcrumbs: breadcrumbs,
                        isBreadcrumbs: isBreadcrumbs,
                        nodeRelationsFilter: nodeRelationsFilter,
                        autokad: autokad
                    });

                    function reset() {
                        search.total = null;

                        _.each(search.byNodeTypes, function(byNodeType, nodeType){
                            byNodeType.request.abort();
                            byNodeType.total = null;
                        });

                        nodeListView.clear();
                    }

                    // Выполнить после отработки кода модуля
                    initPromise.then(initSuccess);
                }
            };
        }])
        .factory('NpRsearchAutokad', ['$log', '$rootScope', '$timeout', 'npAutokadHelper', 'npRsearchAutokadConfig', function($log, $rootScope, $timeout, npAutokadHelper, npRsearchAutokadConfig){

            // Class
            return function() {
                var caseCountPending, caseCountRequest,
                    node;

                var byNodeType = {
                    'COMPANY': {
                        getCaseSearch: function() {
                            return {
                                sources: [
                                    {key: 'company_name', value: node['nameshortsort']},
                                    {key: 'company_ogrn', value: node['ogrn']},
                                    {key: 'company_inn', value: node['inn']}
                                ]
                            };
                        }
                    },
                    'INDIVIDUAL': {
                        getCaseSearch: function() {
                            return {
                                sources: [
                                    {key: node.subtype === 'foreign' ? 'company_name' : 'individual_name', value: node['name']}
                                ]
                            };
                        }
                    }
                };

                reset();

                function reset() {
                    caseCountPending = false;

                    abortCaseCountRequest();
                }

                function abortCaseCountRequest() {
                    if (caseCountRequest) {
                        caseCountRequest.abort();
                    }
                }

                function doGetCaseCount() {
                    var caseSearch = byNodeType[node._type].getCaseSearch();

                    caseCountPending = true;

                    abortCaseCountRequest();

                    caseCountRequest = npAutokadHelper.getCaseCount(
                        caseSearch,
                        function(result, source){
                            node.__autokad.caseCount = result;
                            node.__autokad.searchSource = source;
                            node.__autokad.error = null;
                        },
                        function(){
                            $log.warn('getCaseCount... error');
                            node.__autokad.caseCount = 0;
                            node.__autokad.searchSource = null;
                            node.__autokad.error = true;
                        },
                        function(){
                            caseCountPending = false;
                        });
                }

                function isNodeValid(n) {
                    return !!byNodeType[n._type];
                }

                function setNode(n) {
                    reset();

                    if (!isNodeValid(n)) {
                        return;
                    }

                    node = n;
                    node.__autokad = {
                        caseCount: 0,
                        error: null
                    };

                    if (npRsearchAutokadConfig.gettingCaseCount) {
                        doGetCaseCount();
                    }
                }

                function isNodeWithAutokad() {
                    return node && node.__autokad;
                }

                // API
                return {
                    setNode: setNode,
                    gettingCaseCount: function() {
                        return npRsearchAutokadConfig.gettingCaseCount;
                    },
                    isCaseCountPending: function() {
                        return caseCountPending;
                    },
                    getCaseCount: function() {
                        return isNodeWithAutokad() ? node.__autokad.caseCount : 0;
                    },
                    hasError: function() {
                        return isNodeWithAutokad() ? node.__autokad.error : null;
                    },
                    showCases: function() {
                        $timeout(function(){
                            $rootScope.$emit('np-autokad-do-search', {
                                search: byNodeType[node._type].getCaseSearch(),
                                searchSource: node.__autokad.searchSource
                            });
                        });
                    },
                    clear: function() {
                        reset();
                        $rootScope.$emit('np-autokad-do-clear');
                    }
                };
            };
        }]);
    //
});
