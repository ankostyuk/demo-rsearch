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
        .directive('npRsearchNavigation', ['$log', 'npRsearchViews', 'npRsearchMetaHelper', function($log, npRsearchViews, npRsearchMetaHelper){
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
                    var viewsElement = element.find('.views');

                    //
                    var searchResultByNodeTypeViews = {};

                    _.each(npRsearchMetaHelper.getNodeTypes(), function(nodeType, key){
                        searchResultByNodeTypeViews[key] = npRsearchViews.createNodeListView(viewsElement, scope);
                    });

                    //
                    _.extend(scope, {
                        searchResult: null,
                        activeSearchResult: null,
                        showSearchResult: showSearchResult,
                        breadcrumbs: []
                    });

                    //
                    scope.$on('np.rsearch.search-result', function(e, result){
                        searchResult(result);
                    });

                    scope.$on('np.rsearch.node-select', function(e, node){
                        createNodeForm(node);
                    });

                    scope.$on('np.rsearch.navigation-breadcrumb-go', function(e, breadcrumb){
                        goByBreadcrumb(breadcrumb);
                    });

                    function searchResult(result) {
                        $log.info('result', result);
                        scope.searchResult = result;
                        showSearchResult(result.preferredResult);
                    }

                    function showSearchResult(nodeType) {
                        scope.activeSearchResult = nodeType;

                        hideViews();

                        if (!nodeType) {
                            return;
                        }

                        //
                        var list = scope.searchResult.byNodeTypes[nodeType] ? scope.searchResult.byNodeTypes[nodeType].list : null,
                            view = searchResultByNodeTypeViews[nodeType];

                        view.setList(list);
                        view.element.show();

                        //
                        clearBreadcrumbs();
                        setSearchBreadcrumb(view);
                    }

                    function createNodeForm(node) {
                        hideViews();
                        var view = npRsearchViews.createNodeFormView(viewsElement, scope);
                        view.setNode(node);
                        pushNodeFormBreadcrumb(node, view);
                    }

                    function hideViews() {
                        viewsElement.children().hide();
                    }

                    function showView(view) {
                        view.element.show();
                    }

                    /*
                     * breadcrumbs
                     *
                     */
                    function setSearchBreadcrumb(view) {
                        var index = 0;

                        scope.breadcrumbs[index] = {
                            index: index,
                            type: 'SEARCH',
                            view: view,
                            data: {
                                query: scope.searchResult.query
                            }
                        };
                    }

                    function pushNodeFormBreadcrumb(node, view) {
                        var index = _.size(scope.breadcrumbs);

                        scope.breadcrumbs[index] = {
                            index: index,
                            type: 'NODE_FORM',
                            view: view,
                            data: {
                                node: node
                            }
                        };
                    }

                    function goByBreadcrumb(breadcrumb) {
                        clearBreadcrumbs(breadcrumb.index + 1);
                        hideViews();
                        showView(breadcrumb.view);
                    }

                    function clearBreadcrumbs(fromIndex) {
                        fromIndex = fromIndex || 0;

                        // не очищать view в первом breadcrumb,
                        // т.к. данный view статический -- searchResultByNodeTypeViews
                        for (var i = fromIndex > 0 ? fromIndex : 1; i < _.size(scope.breadcrumbs); i++) {
                            scope.breadcrumbs[i].view.remove();
                        }

                        scope.breadcrumbs = scope.breadcrumbs.slice(0, fromIndex);
                    }
                }]
            };
        }]);
    //
});
