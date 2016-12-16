/**
 * @module rsearch-views
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular'),
        templateUtils   = require('template-utils');

                          require('ng-infinite-scroll');

    var extmodules = {
        'np.directives':                require('np.directives'),
        'np.filters':                   require('np.filters'),
        'np.utils':                     require('np.utils'),
        'nkb.user':                     require('nkb.user'),
        'autokad':                      require('autokad'),
        'fedresursBankruptcy':          require('nkb.extraneous/fedresurs/bankruptcy/company/main'),
        'fnsRegDocs':                   require('nkb.extraneous/fns/reg_docs/company/main'),
        'purchaseDishonestSupplier':    require('nkb.extraneous/purchase/dishonest_supplier/company/main')
    };

    //
    var templates = {
        'np-rsearch-node-simple':                       require('text!./views/rsearch-node-simple.html'),
        'np-rsearch-node-simple-ext':                   require('text!./views/rsearch-node-simple-ext.html'),
        'np-rsearch-node-plain':                        require('text!./views/rsearch-node-plain.html'),
        'np-rsearch-node-info':                         require('text!./views/rsearch-node-info.html'),
        'np-rsearch-node-history-info':                 require('text!./views/rsearch-node-history-info.html'),
        'np-rsearch-node-relations-info':               require('text!./views/rsearch-node-relations-info.html'),
        'np-rsearch-node-relations':                    require('text!./views/rsearch-node-relations.html'),
        'np-rsearch-node-relations-header':             require('text!./views/rsearch-node-relations-header.html'),
        'np-rsearch-navigation-breadcrumb':             require('text!./views/rsearch-navigation-breadcrumb.html'),
        'np-rsearch-node-plain-list':                   require('text!./views/rsearch-node-plain-list.html'),
        'np-rsearch-node-traces':                       require('text!./views/rsearch-node-traces.html'),
        'np-rsearch-user-product-limits-info':          require('text!./views/rsearch-user-product-limits-info.html'),
        'np-rsearch-autokad-info':                      require('text!./views/rsearch-autokad-info.html'),
        'np-rsearch-fedresurs-bankruptcy-info':         require('text!./views/rsearch-fedresurs-bankruptcy-info.html'),
        'np-rsearch-fns-reg-docs-info':                 require('text!./views/rsearch-fns-reg-docs-info.html'),
        'np-rsearch-purchase-dishonest-supplier-info':  require('text!./views/rsearch-purchase-dishonest-supplier-info.html'),
        'np-rsearch-egrul-data-update':                 require('text!./views/rsearch-egrul-data-update.html'),
        'np-rsearch-node-form':                         require('text!./views/rsearch-node-form.html')
    };

    var combinedTemplates = {
        'np-rsearch-node-list':                 require('text!./views/rsearch-node-list.html')
    };

    return angular.module('np.rsearch-views', _.pluck(extmodules, 'name').concat(['infinite-scroll']))
        //
        .run([function(){
            _.each(templates, function(template, name){
                templates[name] = i18n.translateTemplate(template);
            });

            _.each(combinedTemplates, function(template, name){
                var templateData    = templateUtils.processTemplate(template),
                    viewTemplates   = templateData.templates;

                _.each(viewTemplates, function(viewTemplateData, viewName){
                    templates[viewName] = viewTemplateData.html;
                });
            });
        }])
        //
        .directive('npRsearchNodeSimple', [function() {
            return {
                restrict: 'A',
                scope: {
                    node: '=npRsearchNodeSimple',
                    targetInfo: '=npRsearchNodeTargetInfo'
                },
                template: templates['np-rsearch-node-simple'],
                link: function(scope, element, attrs){
                    _.extend(scope, i18n.translateFuncs);
                }
            };
        }])
        //
        .directive('npRsearchNodeSimpleExt', [function() {
            return {
                restrict: 'A',
                scope: {
                    node: '=npRsearchNodeSimpleExt'
                },
                template: templates['np-rsearch-node-simple-ext'],
                link: function(scope, element, attrs){
                    _.extend(scope, i18n.translateFuncs);
                }
            };
        }])
        //
        .directive('npRsearchNodePlain', ['$rootScope', 'nkbUser', 'npRsearchMetaHelper', function($rootScope, nkbUser, npRsearchMetaHelper) {
            return {
                restrict: 'A',
                scope: {
                    node: '=npRsearchNodePlain',
                    targetInfo: '=npRsearchNodeTargetInfo',
                    actions: '=npRsearchNodeRelationsActions'
                },
                template: templates['np-rsearch-node-plain'],
                link: function(scope, element, attrs){
                    _.extend(scope, {
                        user: nkbUser.user(),
                        nodeClick: function(e) {
                            $rootScope.$emit('np-rsearch-node-click', {
                                node: scope.node,
                                element: element,
                                event: e,
                                ui: 'npRsearchNodePlain'
                            });
                        },
                        nodeHeaderClick: function(e) {
                            $rootScope.$emit('np-rsearch-node-header-click', {
                                node: scope.node,
                                element: element,
                                event: e,
                                ui: 'npRsearchNodePlain'
                            });
                        }
                    }, i18n.translateFuncs);
                }
            };
        }])
        //
        .directive('npRsearchNodeInfo', [function() {
            return {
                restrict: 'A',
                scope: false, // require <node>
                template: templates['np-rsearch-node-info']
            };
        }])
        //
        .directive('npRsearchNodeHistoryInfo', [function() {
            return {
                restrict: 'A',
                scope: false, // require <node>
                template: templates['np-rsearch-node-history-info']
            };
        }])
        //
        .directive('npRsearchNodeRelationsInfo', [function() {
            return {
                restrict: 'A',
                scope: {
                    relationsInfo: '=npRsearchNodeRelationsInfo'
                },
                template: templates['np-rsearch-node-relations-info']
            };
        }])
        //
        .directive('npRsearchNodeRelations', ['nkbUser', function(nkbUser) {
            return {
                restrict: 'A',
                scope: {
                    node: '=npRsearchNodeRelations',
                    proxy: '=npRsearchNodeRelationsProxy',
                    actions: '=npRsearchNodeRelationsActions',
                    active: '=npRsearchNodeRelationsActive'
                },
                template: templates['np-rsearch-node-relations'],
                link: function(scope, element, attrs){
                    _.extend(scope, {
                        user: nkbUser.user(),
                    }, i18n.translateFuncs);
                }
            };
        }])
        //
        .directive('npRsearchNodeRelationsHeader', [function() {
            return {
                restrict: 'A',
                scope: {
                    relationsData: '=npRsearchNodeRelationsHeader'
                },
                template: templates['np-rsearch-node-relations-header'],
                link: function(scope, element, attrs){
                    _.extend(scope, i18n.translateFuncs);
                }
            };
        }])
        //
        .directive('npRsearchNavigationBreadcrumb', ['$rootScope', function($rootScope) {
            return {
                restrict: 'A',
                scope: {
                    breadcrumb: '=npRsearchNavigationBreadcrumb',
                    active: '=npRsearchNavigationBreadcrumbActive'
                },
                template: templates['np-rsearch-navigation-breadcrumb'],
                link: function(scope, element, attrs){
                    scope.go = function(){
                        $rootScope.$emit('np-rsearch-navigation-breadcrumb-go', scope.breadcrumb);
                    };
                }
            };
        }])
        //
        .directive('npRsearchNodePlainList', [function() {
            return {
                restrict: 'A',
                scope: {
                    nodeList: '=npRsearchNodePlainList',
                    showItemNumber: '=npRsearchNodePlainListShowItemNumber',
                    targetInfo: '=npRsearchNodePlainListTargetInfo',
                    actions: '=npRsearchNodePlainListActions'
                },
                template: templates['np-rsearch-node-plain-list']
            };
        }])
        //
        .directive('npRsearchNodeJointList', [function() {
            return {
                restrict: 'A',
                scope: {
                    nodeList: '=npRsearchNodeJointList',
                    showItemNumber: '=npRsearchNodeJointListShowItemNumber',
                    targetInfo: '=npRsearchNodeJointListTargetInfo',
                    actions: '=npRsearchNodeJointListActions',
                    showHeaders: '=npRsearchNodeJointListShowHeaders'
                },
                template: templates['np-rsearch-node-joint-list'],
                link: function(scope, element, attrs){
                    _.extend(scope, i18n.translateFuncs);
                }
            };
        }])
        //
        .directive('npRsearchUserProductLimitsInfo', ['$rootScope', function($rootScope) {
            return {
                restrict: 'A',
                scope: {
                    info: '=npRsearchUserProductLimitsInfo'
                },
                template: templates['np-rsearch-user-product-limits-info']
            };
        }])
        //
        .directive('npRsearchAutokadInfo', [function() {
            return {
                restrict: 'A',
                scope: {
                    autokad: '=npRsearchAutokadInfo',
                    autokadClick: '=npRsearchAutokadClick'
                },
                template: templates['np-rsearch-autokad-info']
            };
        }])
        //
        .directive('npRsearchFedresursBankruptcyInfo', [function() {
            return {
                restrict: 'A',
                scope: {
                    fedresursBankruptcy: '=npRsearchFedresursBankruptcyInfo',
                    fedresursBankruptcyClick: '=npRsearchFedresursBankruptcyClick'
                },
                template: templates['np-rsearch-fedresurs-bankruptcy-info']
            };
        }])
        //
        .directive('npRsearchFnsRegDocsInfo', [function() {
            return {
                restrict: 'A',
                scope: {
                    fnsRegDocs: '=npRsearchFnsRegDocsInfo',
                    fnsRegDocsClick: '=npRsearchFnsRegDocsClick'
                },
                template: templates['np-rsearch-fns-reg-docs-info']
            };
        }])
        //
        .directive('npRsearchPurchaseDishonestSupplierInfo', [function() {
            return {
                restrict: 'A',
                scope: {
                    purchaseDishonestSupplier: '=npRsearchPurchaseDishonestSupplierInfo',
                    purchaseDishonestSupplierClick: '=npRsearchPurchaseDishonestSupplierClick'
                },
                template: templates['np-rsearch-purchase-dishonest-supplier-info']
            };
        }])
        //
        .directive('npRsearchEgrulDataUpdate', [function() {
            return {
                restrict: 'A',
                // require:
                // {
                //     dataUpdateHelper: Object,
                //     node: Object
                // }
                scope: false,
                template: templates['np-rsearch-egrul-data-update']
            };
        }])
        //
        .factory('npRsearchViews', ['$log', '$filter', '$compile', '$rootScope', '$timeout', '$window', 'SimplePager', 'nkbUser', 'npRsearchMetaHelper', 'npRsearchRelationHelper', function($log, $filter, $compile, $rootScope, $timeout, $window, SimplePager, nkbUser, npRsearchMetaHelper, npRsearchRelationHelper){

            var htmlbodyElement = $('html, body');

            function createView(name, parent, parentScope, scopeData) {
                var scope = parentScope.$new(true);
                _.extend(scope, scopeData);

                var attr = {};
                attr[name] = '';

                var element = $('<div>', {
                    attr: attr,
                    html: templates[name]
                });

                $compile(element)(scope);
                element.appendTo(parent);

                return {
                    element: element,
                    scope: scope,
                    remove: function() {
                        element.remove();
                        scope.$destroy();
                    },
                    toggle: function(show) {
                        element.toggle(show);
                    },
                    show: function() {
                        element.show();
                    },
                    hide: function() {
                        element.hide();
                    }
                };
            }

            //
            return {

                createNodeListView: function(parent, parentScope, proxy) {
                    var view                = createView('np-rsearch-node-list', parent, parentScope),
                        scope               = view.scope,
                        internalDisabled    = false,
                        noNextPage          = false,
                        nextPageHandler     = null,
                        scrollMargin        = 5, // TODO взять из CSS
                        scrollDuration      = 200;

                    _.extend(view, {
                        type: 'NODE_LIST',
                        reset: function(nodeList, noMore, pageHandler, listProperties) {
                            scope.nodeList = nodeList;
                            scope.targetInfo = null;
                            scope.listProperties = listProperties;

                            internalDisabled = false;
                            noNextPage = noMore;
                            nextPageHandler = pageHandler;

                            resetNodeListProxy();
                            showNodeListProxy(scope.nodeList, scope.nodeList);
                        },
                        clear: function() {
                            scope.nodeList = null;
                            scope.listProperties = null;

                            internalDisabled = false;
                            noNextPage = false;
                            nextPageHandler = null;
                        },
                        getNodeElement: function(node) {
                            var nodeElement = view.element.find('[node-id="' + node._id + '"]').parent();
                            return nodeElement.length === 1 ? nodeElement : null;
                        },
                        scrollToNode: function(node) {
                            $timeout(function(){
                                var nodeElement = view.getNodeElement(node);

                                if (!nodeElement) {
                                    return;
                                }

                                var scrollContainer = scope.scrollContainer || htmlbodyElement,
                                    top             = scope.scrollContainer ? (nodeElement.offset().top - scope.scrollContainer.offset().top) : nodeElement.offset().top;

                                scrollContainer.animate({
                                    scrollTop: top - scrollMargin
                                }, scrollDuration);
                            });
                        },
                        scrollTop: function() {
                            (scope.scrollContainer || htmlbodyElement).scrollTop(0);
                        },
                        showItemNumber: function(show) {
                            scope.showItemNumber = show;
                        },
                        setTargetInfo: function(targetInfo) {
                            scope.targetInfo = targetInfo;
                        }
                    });

                    _.extend(scope, {
                        nodeList: null,
                        targetInfo: null,
                        listProperties: {
                            history: null,
                            isJoint: false
                        },
                        scrollContainer: proxy.getScrollContainer(),
                        actions: {
                            relationsClick: function(direction, relationType, node, e) {
                                e.stopPropagation();
                                $rootScope.$emit('np-rsearch-node-list-relations-click', node, direction, relationType);
                            }
                        },
                        pager: {
                            nextPage: function() {
                                if (!isDisabled() && nextPageHandler) {
                                    internalDisabled = true;

                                    nextPageHandler(function(noMore, pushNodeList){
                                        internalDisabled = false;
                                        noNextPage = noMore;

                                        showNodeListProxy(scope.nodeList, pushNodeList);
                                    });
                                }
                            },
                            isDisabled: isDisabled
                        }
                    }, i18n.translateFuncs);

                    function isDisabled() {
                        return internalDisabled || noNextPage || !nextPageHandler;
                    }

                    function resetNodeListProxy() {
                        proxy.resetNodeList(view);
                    }

                    function showNodeListProxy(nodeList, addNodeList) {
                        $timeout(function(){
                            proxy.showNodeList(nodeList, addNodeList, view, scope.listProperties);
                        });
                    }

                    return view;
                },

                createNodeTracesView: function(parent, parentScope, proxy) {
                    var view            = createView('np-rsearch-node-traces', parent, parentScope),
                        tracesElement   = view.element.find('.traces'),
                        scope           = view.scope;

                    _.extend(view, {
                        type: 'NODE_TRACES',
                        setNodes: function(nodes) {
                            scope.nodes = _.isArray(nodes) ? nodes : [];
                            scope.currentTrace = null;
                        },
                        getNodes: function(nodes) {
                            return scope.nodes;
                        },
                        setFilters: function(filters) {
                            if (_.isObject(filters)) {
                                _.extend(scope.filters, filters);
                            }
                        },
                        setDataSource: function(dataSource) {
                            // ? TODO reset prev dataSource
                            // if (scope.dataSource) {
                            // }

                            scope.dataSource = dataSource;
                            scope.filters.depths = dataSource.depths;
                            reset();
                        },
                        setResult: function(nodes, filters, result, traceIndex, silent) {
                            view.setNodes(nodes);
                            view.setFilters(filters);
                            applyResult(result, traceIndex, silent);
                            doTrace(silent);
                        },
                        buildResultHTML: function(nodes, result) {
                            return buildResultHTML(nodes, result);
                        },
                        reset: reset,
                        getTracesElement: function() {
                            return tracesElement;
                        },
                        getNodeElement: function(node) {
                            var nodeElement = view.element.find('[node-uid="' + node.__uid + '"]');
                            return nodeElement.length === 1 ? nodeElement : null;
                        },
                        scrollTop: function() {
                            (scope.scrollContainer || htmlbodyElement).scrollTop(0);
                        }
                    });

                    _.extend(scope, {
                        scrollContainer: proxy.getScrollContainer(),
                        proxy: proxy,
                        nodes: [],
                        filters: {
                            depths: null,
                            depth: null,
                            history: null
                        },
                        dataSource: null,
                        result: null,
                        traceIndex: 0,
                        traceCount: null,
                        currentTrace: null,
                        pager: new SimplePager({
                            prevPage: function(pageNumber) {
                                scope.traceIndex--;
                                doTrace();
                            },
                            nextPage: function(pageNumber) {
                                scope.traceIndex++;
                                doTrace();
                            }
                        }),
                        nodeClick: function(e, tracePart) {
                            scope.dataSource.nodeClick(tracePart, {
                                node: tracePart.node,
                                element: null,
                                event: e,
                                ui: 'npRsearchNodeTraces'
                            });
                        },
                        doTraces: function() {
                            if (!scope.dataSource || !scope.filters.depth) {
                                return;
                            }

                            scope.filters.history = scope.filters.history || null;

                            scope.traceCount = null;
                            // scope.currentTrace = null; // ? TODO Очищать перед запросом

                            scope.dataSource.tracesRequest({
                                nodes: scope.nodes,
                                filters: scope.filters
                            }, function(result){
                                if (scope.dataSource.reverse && result && result.traces) {
                                    _.each(result.traces, function(trace){
                                        trace.nodes.reverse();
                                    });
                                }

                                applyResult(result);
                                doTrace();
                            });
                        },
                        actions: {
                        }
                    });

                    function reset() {
                        scope.filters.depth = null;
                        scope.filters.history = null;
                        scope.result = null;
                        scope.traceIndex = 0;
                        scope.traceCount = null;
                        scope.currentTrace = null;
                        scope.pager.reset();
                    }

                    // Убрать дубликаты цепочек
                    // TODO на сервере. Много раз вызывается :(
                    // TODO убрать данный код,
                    // когда дубликаты цепочек будут убраны на сервере
                    function normalizeResult(result) {
                        var uniqTraces = [];

                        _.each(result.traces, function(trace, i){
                            if (!_.isEqual(trace, result.traces[i - 1])) {
                                uniqTraces.push(trace);
                            }
                        });

                        result.traces = uniqTraces;
                    }

                    function applyResult(result, traceIndex, silent) {
                        normalizeResult(result);

                        scope.result = result || {};
                        scope.traceIndex = traceIndex || 0;

                        scope.traceCount = _.size(scope.result.traces);

                        scope.pager.reset({
                            pageCount: scope.traceCount,
                            pageNumber: scope.traceIndex + 1
                        });

                        if (!silent && _.isFunction(scope.dataSource.applyResult)) {
                            scope.dataSource.applyResult(_.clone(scope.nodes), _.cloneDeep(scope.filters), scope.result);
                        }
                    }

                    // function doTrace(silent) {
                    //     if (!silent && _.isFunction(scope.dataSource.doTrace)) {
                    //         scope.dataSource.doTrace(scope.traceIndex);
                    //     }
                    //
                    //     if (scope.traceCount < 1) {
                    //         scope.currentTrace = null;
                    //         return;
                    //     }
                    //
                    //     var trace           = scope.result.traces[scope.traceIndex],
                    //         nodes           = scope.result.nodes,
                    //         nodeIndexes     = trace.nodes,
                    //         nodeCount       = _.size(nodeIndexes),
                    //         currentTrace    = new Array(nodeCount),
                    //         isLast, node, relation, direction, relationsInfo, targetNode, isSrcNode;
                    //
                    //     _.each(nodeIndexes, function(nodeIndex, i){
                    //         isLast      = (i === nodeCount - 1);
                    //         node        = nodes[nodeIndex];
                    //
                    //         // Именно при отображении цепочки,
                    //         // а не в ответе запроса на поиск цепочек,
                    //         // т.к. ответ может быть "жирным" - оптимизация
                    //         // @Deprecated
                    //         npRsearchMetaHelper.buildNodeExtraMeta(node);
                    //
                    //         // TODO оптимизировать
                    //         isSrcNode = !!_.find(scope.nodes, function(n){
                    //             return n.__uid === node.__uid;
                    //         });
                    //
                    //         if (isLast) {
                    //             relation        = null;
                    //             direction       = null;
                    //             relationsInfo   = null;
                    //         } else {
                    //             // relation    = relations[relationIndexes[i]];
                    //             // direction   = relation._srcId === node._id ? 'parents' : 'children';
                    //
                    //             targetNode  = nodes[nodeIndexes[i + 1]];
                    //
                    //             // TODO оптимизировать:
                    //             // при обходе цепочек данные функции могут вызываться повторно для обойденных нод
                    //             npRsearchMetaHelper.buildNodeExtraMeta(targetNode);
                    //             npRsearchMetaHelper.buildNodeRelationMap(targetNode);
                    //             npRsearchMetaHelper.buildNodeRelationMap(node);
                    //
                    //             // relationsInfo = npRsearchRelationHelper.buildRelationsInfoBetweenNodes(node, targetNode);
                    //             // direction = relationsInfo.direction;
                    //
                    //             npRsearchMetaHelper.addToRelationMap(relationMap, targetNode, targetNode._relations);
                    //
                    //             relation    = getFirstRelation(node, targetNode);
                    //             direction   = relation._srcId === node._id ? 'parents' : 'children';
                    //
                    //             targetInfo = {
                    //                 node: targetNode,
                    //                 relationInfo: {
                    //                     direction: direction,
                    //                     relationType: relation._type,
                    //                     relationMap: relationMap
                    //                 }
                    //             };
                    //         }
                    //
                    //         currentTrace[i] = {
                    //             isLast: isLast,
                    //             inTrace: isSrcNode ? scope.dataSource.srcInTrace : true,
                    //             node: node,
                    //             relationsInfo: relationsInfo,
                    //             direction: direction
                    //         };
                    //     });
                    //
                    //     scope.currentTrace = currentTrace;
                    //
                    //     showTraceProxy(scope.currentTrace);
                    // }

                    function doTrace(silent) {
                        if (!silent && _.isFunction(scope.dataSource.doTrace)) {
                            scope.dataSource.doTrace(scope.traceIndex);
                        }

                        if (scope.traceCount < 1) {
                            scope.currentTrace = null;
                            return;
                        }

                        // var trace           = scope.result.traces[scope.traceIndex],
                        //     nodes           = scope.result.nodes,
                        //     nodeIndexes     = trace.nodes,
                        //     nodeCount       = _.size(nodeIndexes),
                        //     currentTrace    = new Array(nodeCount),
                        //     isLast, node, relation, direction, relationsInfo, targetNode, isSrcNode;
                        //
                        // _.each(nodeIndexes, function(nodeIndex, i){
                        //     isLast      = (i === nodeCount - 1);
                        //     node        = nodes[nodeIndex];
                        //
                        //     // Именно при отображении цепочки,
                        //     // а не в ответе запроса на поиск цепочек,
                        //     // т.к. ответ может быть "жирным" - оптимизация
                        //     // @Deprecated
                        //     npRsearchMetaHelper.buildNodeExtraMeta(node);
                        //
                        //     // TODO оптимизировать
                        //     isSrcNode = !!_.find(scope.nodes, function(n){
                        //         return n.__uid === node.__uid;
                        //     });
                        //
                        //     if (isLast) {
                        //         relation        = null;
                        //         direction       = null;
                        //         relationsInfo   = null;
                        //     } else {
                        //         targetNode  = nodes[nodeIndexes[i + 1]];
                        //
                        //         // TODO оптимизировать:
                        //         // при обходе цепочек данные функции могут вызываться повторно для обойденных нод
                        //         npRsearchMetaHelper.buildNodeExtraMeta(targetNode);
                        //         npRsearchMetaHelper.buildNodeRelationMap(targetNode);
                        //         npRsearchMetaHelper.buildNodeRelationMap(node);
                        //
                        //         relationsInfo = npRsearchRelationHelper.buildRelationsInfoBetweenNodes(node, targetNode);
                        //         direction = relationsInfo.direction;
                        //     }
                        //
                        //     currentTrace[i] = {
                        //         isLast: isLast,
                        //         inTrace: isSrcNode ? scope.dataSource.srcInTrace : true,
                        //         node: node,
                        //         relationsInfo: relationsInfo,
                        //         direction: direction
                        //     };
                        // });
                        //
                        // scope.currentTrace = currentTrace;

                        var trace   = scope.result.traces[scope.traceIndex],
                            nodes   = scope.result.nodes;

                        scope.currentTrace = buildCurrentTrace(trace, nodes);

                        showTraceProxy(scope.currentTrace);
                    }

                    function buildCurrentTrace(trace, nodes) {
                        var nodeIndexes     = trace.nodes,
                            nodeCount       = _.size(nodeIndexes),
                            currentTrace    = new Array(nodeCount),
                            isLast, node, relation, direction, relationsInfo, targetNode, isSrcNode;

                        _.each(nodeIndexes, function(nodeIndex, i){
                            isLast      = (i === nodeCount - 1);
                            node        = nodes[nodeIndex];

                            // Именно при отображении цепочки,
                            // а не в ответе запроса на поиск цепочек,
                            // т.к. ответ может быть "жирным" - оптимизация
                            // @Deprecated
                            npRsearchMetaHelper.buildNodeExtraMeta(node);

                            // TODO оптимизировать
                            isSrcNode = !!_.find(scope.nodes, function(n){
                                return n.__uid === node.__uid;
                            });

                            if (isLast) {
                                relation        = null;
                                direction       = null;
                                relationsInfo   = null;
                            } else {
                                targetNode  = nodes[nodeIndexes[i + 1]];

                                // TODO оптимизировать:
                                // при обходе цепочек данные функции могут вызываться повторно для обойденных нод
                                npRsearchMetaHelper.buildNodeExtraMeta(targetNode);
                                npRsearchMetaHelper.buildNodeRelationMap(targetNode);
                                npRsearchMetaHelper.buildNodeRelationMap(node);

                                if (scope.dataSource.reverse) {
                                    relationsInfo = npRsearchRelationHelper.buildRelationsInfoBetweenNodes(node, targetNode);
                                } else {
                                    relationsInfo = npRsearchRelationHelper.buildRelationsInfoBetweenNodes(targetNode, node);
                                }

                                direction = relationsInfo.direction;
                            }

                            currentTrace[i] = {
                                isLast: isLast,
                                inTrace: isSrcNode ? scope.dataSource.srcInTrace : true,
                                node: node,
                                relationsInfo: relationsInfo,
                                direction: direction
                            };
                        });

                        return currentTrace;
                    }

                    function buildResultHTML(nodes, result) {
                        normalizeResult(result);

                        var resultText = ''
                            + ('<h3>' + $filter('nodeNameHtml')(nodes[0]) + '</h3>')
                            + 'и'
                            + ('<h3>' + $filter('nodeNameHtml')(nodes[1]) + '</h3>')
                            + '<br>'
                            + 'через связи:'
                            + '<br>'
                            + '<br>'
                            + '';

                        _.each(result.traces, function(trace, i){
                            if (i > 0) {
                                resultText += ''
                                    + '<br>'
                                    + '***'
                                    + '<br>'
                                    + '<br>'
                                    + '';
                            }

                            var currentTrace = buildCurrentTrace(trace, result.nodes);

                            // var nodes           = result.nodes,
                            //     nodeIndexes     = trace.nodes,
                            //     nodeCount       = _.size(nodeIndexes),
                            //     currentTrace    = new Array(nodeCount),
                            //     isLast, node, relation, direction, relationMap, targetInfo, targetNode, isSrcNode;
                            //
                            // _.each(nodeIndexes, function(nodeIndex, i){
                            //     isLast      = (i === nodeCount - 1);
                            //     node        = nodes[nodeIndex];
                            //     relationMap = {};
                            //
                            //     npRsearchMetaHelper.buildNodeExtraMeta(node);
                            //
                            //     isSrcNode = !!_.find(scope.nodes, function(n){
                            //         return n.__uid === node.__uid;
                            //     });
                            //
                            //     if (isLast) {
                            //         relation    = null;
                            //         direction   = null;
                            //         targetInfo  = null;
                            //     } else {
                            //         targetNode  = nodes[nodeIndexes[i + 1]];
                            //         npRsearchMetaHelper.buildNodeExtraMeta(targetNode);
                            //
                            //         npRsearchMetaHelper.buildNodeRelationMap(node);
                            //         npRsearchMetaHelper.addToRelationMap(relationMap, targetNode, targetNode._relations);
                            //
                            //         relation    = getFirstRelation(node, targetNode);
                            //         direction   = relation._srcId === node._id ? 'parents' : 'children';
                            //
                            //         targetInfo = {
                            //             node: targetNode,
                            //             relationInfo: {
                            //                 direction: direction,
                            //                 relationType: relation._type,
                            //                 relationMap: relationMap
                            //             }
                            //         };
                            //     }
                            //
                            //     currentTrace[i] = {
                            //         isLast: isLast,
                            //         inTrace: isSrcNode ? scope.dataSource.srcInTrace : true,
                            //         node: node,
                            //         targetInfo: targetInfo,
                            //         direction: direction
                            //     };
                            // });

                            _.each(currentTrace, function(tracePart){
                                var relationText;

                                resultText += ''
                                    + ('<div>' + $filter('nodeNameHtml')(tracePart.node) + '</div>')
                                    + '';

                                if (!tracePart.isLast) {
                                    resultText += '<div style="color: #808080;">';

                                    // relationText = $filter('targetRelationsInfo')(tracePart.targetInfo, tracePart.node, true, true, '<br>');
                                    relationText = buildRelationText(tracePart.relationsInfo);

                                    if (relationText) {
                                        resultText += ''
                                            + ('<div>' + (tracePart.direction === 'parents' ? '↑' : '|') + '</div>')
                                            + ('<div>' + relationText + '</div>')
                                            + ('<div>' + (tracePart.direction === 'parents' ? '|' : '↓') + '</div>')
                                            + '';
                                    } else {
                                        resultText += ''
                                            + ('<div>' + (tracePart.direction === 'parents' ? '↑' : '↓') + '</div>')
                                            + '';
                                    }

                                    resultText += '</div>';
                                }
                            });
                        });

                        // return resultText.replace(/<i class="icon i-history"><\/i>/gi, '∅ ');
                        return resultText;
                    }

                    // TODO перенести в rsearch-meta.js, сделать $filter
                    function buildRelationText(relationsInfo) {
                        var relationText = '';

                        _.each(relationsInfo.list, function(relationData){
                            _.each(relationData.texts, function(textData){
                                relationText += textData.text ? ((textData.outdated ? '∅ ' : '') + textData.text + ' — ') : '';
                                relationText += textData.sinceText + ' ' + textData.actualText + ' ';
                            });
                            relationText += '<br>';
                        });

                        relationText += relationsInfo.innText ? relationsInfo.innText : '';

                        return relationText;
                    }

                    // @Deprecated
                    // function getFirstRelation(node1, node2) {
                    //     var byDirections    = _.get(node1.__relationMap, ['byNodes', node2.__uid]),
                    //         byTypes         = byDirections['children'] || byDirections['parents'];
                    //
                    //     var relationInfo = _.find(byTypes, function(){
                    //         return true;
                    //     });
                    //
                    //     var relationId = relationInfo && relationInfo.relationId,
                    //         relation = _.get(node1.__relationMap, ['relations', relationId, 'relation']);
                    //
                    //     return relation;
                    // }

                    function showTraceProxy(trace) {
                        $timeout(function(){
                            proxy.showTrace(trace, view);
                        });
                    }

                    return view;
                },

                createNodeFormView: function(parent, parentScope, proxy) {
                    var view    = createView('np-rsearch-node-form', parent, parentScope),
                        scope   = view.scope;

                    _.extend(view, {
                        type: 'NODE_FORM',
                        setNode: function(node) {
                            scope.node = node;
                            showNodeFormProxy(scope.node, scope.formType);
                        },
                        setFormType: function(formType) {
                            scope.formType = formType;
                        },
                        setAutokad: function(autokad) {
                            scope.actions.autokad = autokad;
                        },
                        setFedresursBankruptcy: function(fedresursBankruptcy) {
                            scope.actions.fedresursBankruptcy = fedresursBankruptcy;
                        },
                        setFnsRegDocs: function(fnsRegDocs) {
                            scope.actions.fnsRegDocs = fnsRegDocs;
                        },
                        setPurchaseDishonestSupplier: function(purchaseDishonestSupplier) {
                            scope.actions.purchaseDishonestSupplier = purchaseDishonestSupplier;
                        },
                        getNodeElement: function(node) {
                            var nodeElement = view.element.find('[np-rsearch-node-info]');
                            return nodeElement.length === 1 ? nodeElement : null;
                        },
                        scrollTop: function() {
                            (scope.scrollContainer || htmlbodyElement).scrollTop(0);
                        }
                    });

                    _.extend(scope, {
                        user: nkbUser.user(),
                        scrollContainer: proxy.getScrollContainer(),
                        dataUpdateHelper: proxy.getDataUpdateHelper(),
                        proxy: proxy,
                        actions: {
                            relationsClick: function(direction, relationType) {
                                $rootScope.$emit('np-rsearch-node-form-relations-click', scope.node, direction, relationType);
                            },
                            productClick: function(productName) {
                                $rootScope.$emit('np-rsearch-node-form-product-click', productName, scope.node);
                            },
                            individualClick: function() {
                                $rootScope.$emit('np-rsearch-node-form-individual-click', scope.node);
                            },
                            autokadClick: function() {
                                $rootScope.$emit('np-rsearch-node-form-autokad-click', scope.node);
                            },
                            fedresursBankruptcyClick: function() {
                                $rootScope.$emit('np-rsearch-node-form-fedresurs-bankruptcy-click', scope.node);
                            },
                            fnsRegDocsClick: function() {
                                $rootScope.$emit('np-rsearch-node-form-fns-reg-docs-click', scope.node);
                            },
                            purchaseDishonestSupplierClick: function() {
                                $rootScope.$emit('np-rsearch-node-form-purchase-dishonest-supplier-click', scope.node);
                            }
                        }
                    }, i18n.translateFuncs);

                    function showNodeFormProxy(node, formType) {
                        $timeout(function(){
                            proxy.showNodeForm(node, formType, view);
                        });
                    }

                    return view;
                }
            };
        }]);
    //
});
