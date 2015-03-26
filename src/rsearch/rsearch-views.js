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
        'autokad':        require('autokad'),
        'fnsRegDocs':     require('nkb.extraneous/fns/reg_docs/company/main')
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
        'np-rsearch-fns-reg-docs-info':             require('text!./views/rsearch-fns-reg-docs-info.html'),
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
                        toggleSelect: function() {
                            $rootScope.$emit('np-rsearch-node-select', scope.node, element);
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
                    active: '=npRsearchNodeRelationsActive',
                    relationsClick: '=npRsearchNodeRelationsClick',
                    productClick: '=npRsearchNodeProductClick',
                    autokad: '=npRsearchNodeRelationsAutokad',
                    autokadClick: '=npRsearchNodeAutokadClick',
                    fnsRegDocs: '=npRsearchNodeRelationsFnsRegDocs',
                    fnsRegDocsClick: '=npRsearchNodeFnsRegDocsClick'
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
        .directive('npRsearchFnsRegDocsInfo', [function() {
            return {
                restrict: 'A',
                // require:
                // {
                //     fnsRegDocsClick: Function,
                //     fnsRegDocs: Object
                // }
                scope: false,
                template: templates['np-rsearch-fns-reg-docs-info']
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

                createNodeListView: function(parent, parentScope, options) {
                    var view                = createView('np-rsearch-node-list', parent, parentScope),
                        scope               = view.scope,
                        internalDisabled    = false,
                        noNextPage          = false,
                        nextPageHandler     = null,
                        scrollMargin        = 5; // TODO взять из CSS

                    _.extend(view, {
                        reset: function(nodeList, noMore, pageHandler){
                            scope.nodeList = nodeList;
                            scope.targetInfo = null;

                            internalDisabled = false;
                            noNextPage = noMore;
                            nextPageHandler = pageHandler;

                            refresh();
                        },
                        clear: function(){
                            scope.nodeList = null;

                            internalDisabled = false;
                            noNextPage = false;
                            nextPageHandler = null;
                        },
                        scrollToNode: function(node){
                            $timeout(function(){
                                var nodeElement = view.element.find('[node-id="' + node._id + '"]');

                                if (nodeElement.length !== 1) {
                                    return;
                                }

                                htmlbodyElement.animate({
                                    scrollTop: nodeElement.offset().top - scrollMargin
                                }, 200);
                            });
                        },
                        showItemNumber: function(show){
                            scope.showItemNumber = show;
                        },
                        setTargetInfo: function(targetInfo){
                            scope.targetInfo = targetInfo;
                        }
                    });

                    _.extend(scope, {
                        nodeList: null,
                        targetInfo: null,
                        pager: {
                            nextPage: function(){
                                if (!isDisabled() && nextPageHandler) {
                                    internalDisabled = true;

                                    nextPageHandler(function(noMore){
                                        internalDisabled = false;
                                        noNextPage = noMore;
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

                    return view;
                },

                createNodeFormView: function(parent, parentScope) {
                    var view    = createView('np-rsearch-node-form', parent, parentScope),
                        scope   = view.scope;

                    _.extend(view, {
                        setNode: function(node){
                            scope.node = node;
                        },
                        setFormType: function(formType){
                            scope.formType = formType;
                        },
                        setAutokad: function(autokad){
                            scope.autokad = autokad;
                        },
                        setFnsRegDocs: function(fnsRegDocs){
                            scope.fnsRegDocs = fnsRegDocs;
                        }
                    });

                    _.extend(scope, {
                        user: nkbUser.user(),
                        relationsClick: function(direction, relationType){
                            $rootScope.$emit('np-rsearch-node-form-relations-click', scope.node, direction, relationType);
                        },
                        productClick: function(productName){
                            $rootScope.$emit('np-rsearch-node-form-product-click', productName, scope.node);
                        },
                        autokadClick: function(){
                            $rootScope.$emit('np-rsearch-node-form-autokad-click', scope.node);
                        },
                        fnsRegDocsClick: function(){
                            $rootScope.$emit('np-rsearch-node-form-fns-reg-docs-click', scope.node);
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
