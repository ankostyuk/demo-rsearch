/**
 * @module rsearch-views
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular');

                          require('ng-infinite-scroll');

    var extmodules = {
        'np.directives':  require('np.directives'),
        'np.filters':     require('np.filters'),
        'nkb.user':       require('nkb.user'),
        'autokad':        require('autokad')
    };

    //
    var templates = {
        'np-rsearch-node-simple':                   require('text!./views/rsearch-node-simple.html'),
        'np-rsearch-node-plain':                    require('text!./views/rsearch-node-plain.html'),
        'np-rsearch-node-info':                     require('text!./views/rsearch-node-info.html'),
        'np-rsearch-node-history-info':             require('text!./views/rsearch-node-history-info.html'),
        'np-rsearch-node-relations':                require('text!./views/rsearch-node-relations.html'),
        'np-rsearch-node-relations-header':         require('text!./views/rsearch-node-relations-header.html'),
        'np-rsearch-navigation-breadcrumb':         require('text!./views/rsearch-navigation-breadcrumb.html'),
        'np-rsearch-node-list':                     require('text!./views/rsearch-node-list.html'),
        'np-rsearch-user-product-limits-info':      require('text!./views/rsearch-user-product-limits-info.html'),
        'np-rsearch-autokad-info':                  require('text!./views/rsearch-autokad-info.html'),
        'np-rsearch-node-form':                     require('text!./views/rsearch-node-form.html')
    };

    return angular.module('np.rsearch-views', _.pluck(extmodules, 'name').concat(['infinite-scroll']))
        //
        .run([function(){
            _.each(templates, function(template, name){
                templates[name] = i18n.translateTemplate(template);
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
                template: templates['np-rsearch-node-simple']
            };
        }])
        //
        .directive('npRsearchNodePlain', ['$rootScope', 'nkbUser', function($rootScope, nkbUser) {
            return {
                restrict: 'A',
                scope: {
                    node: '=npRsearchNodePlain',
                    targetInfo: '=npRsearchNodeTargetInfo'
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
        .directive('npRsearchNodeRelations', ['nkbUser', function(nkbUser) {
            return {
                restrict: 'A',
                scope: {
                    node: '=npRsearchNodeRelations',
                    autokad: '=npRsearchNodeRelationsAutokad',
                    active: '=npRsearchNodeRelationsActive',
                    relationsClick: '=npRsearchNodeRelationsClick',
                    productClick: '=npRsearchNodeProductClick',
                    autokadClick: '=npRsearchNodeAutokadClick'
                },
                template: templates['np-rsearch-node-relations'],
                link: function(scope, element, attrs){
                    scope.user = nkbUser.user();
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
                template: templates['np-rsearch-node-relations-header']
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
                // require:
                // {
                //     autokadClick: Function,
                //     autokad: Object
                // }
                scope: false,
                template: templates['np-rsearch-autokad-info']
            };
        }])
        //
        .factory('npRsearchViews', ['$log', '$compile', '$rootScope', '$timeout', '$window', 'nkbUser', function($log, $compile, $rootScope, $timeout, $window, nkbUser){

            var windowElement   = angular.element($window),
                htmlbodyElement = $('html, body');

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
                        scrollMargin        = 5; // TODO взять из CSS

                    _.extend(view, {
                        reset: function(nodeList, noMore, pageHandler) {
                            scope.nodeList = nodeList;
                            scope.targetInfo = null;

                            internalDisabled = false;
                            noNextPage = noMore;
                            nextPageHandler = pageHandler;

                            refresh();

                            resetNodeListProxy();
                            showNodeListProxy(scope.nodeList, scope.nodeList);
                        },
                        clear: function() {
                            scope.nodeList = null;

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

                                htmlbodyElement.animate({
                                    scrollTop: nodeElement.offset().top - scrollMargin
                                }, 200);
                            });
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
                        scrollContainer: proxy.getScrollContainer(),
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
                    });

                    function isDisabled() {
                        return internalDisabled || noNextPage || !nextPageHandler;
                    }

                    function refresh() {
                        //windowElement.trigger('scroll');
                    }

                    function resetNodeListProxy() {
                            proxy.resetNodeList(view);
                    }

                    function showNodeListProxy(nodeList, addNodeList) {
                        $timeout(function(){
                            proxy.showNodeList(nodeList, addNodeList, view);
                        });
                    }

                    return view;
                },

                createNodeFormView: function(parent, parentScope) {
                    var view    = createView('np-rsearch-node-form', parent, parentScope),
                        scope   = view.scope;

                    _.extend(view, {
                        setNode: function(node) {
                            scope.node = node;
                        },
                        setFormType: function(formType) {
                            scope.formType = formType;
                        },
                        setAutokad: function(autokad) {
                            scope.autokad = autokad;
                        }
                    });

                    _.extend(scope, {
                        user: nkbUser.user(),
                        relationsClick: function(direction, relationType) {
                            $rootScope.$emit('np-rsearch-node-form-relations-click', scope.node, direction, relationType);
                        },
                        productClick: function(productName) {
                            $rootScope.$emit('np-rsearch-node-form-product-click', productName, scope.node);
                        },
                        autokadClick: function() {
                            $rootScope.$emit('np-rsearch-node-form-autokad-click', scope.node);
                        }
                    }, i18n.translateFuncs);

                    return view;
                },

                scrollTop: function() {
                    $timeout(function(){
                        htmlbodyElement.scrollTop(0);
                    });
                }
            };
        }]);
    //
});
