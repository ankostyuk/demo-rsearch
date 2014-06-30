/**
 * @module rsearch-views
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('jquery');
                          require('underscore');
    var i18n            = require('i18n'),
        angular         = require('angular');
                          require('ng-infinite-scroll');

    //
    var templates = {
        'np-rsearch-node-simple':               require('text!./views/rsearch-node-simple.html'),
        'np-rsearch-node-plain':                require('text!./views/rsearch-node-plain.html'),
        'np-rsearch-node-relations-counts':     require('text!./views/rsearch-node-relations-counts.html'),
        'np-rsearch-node-relations-header':     require('text!./views/rsearch-node-relations-header.html'),
        'np-rsearch-navigation-breadcrumb':     require('text!./views/rsearch-navigation-breadcrumb.html'),
        'np-rsearch-node-list':                 require('text!./views/rsearch-node-list.html'),
        'np-rsearch-node-form':                 require('text!./views/rsearch-node-form.html')
    };

    return angular.module('np.rsearch-views', ['infinite-scroll'])
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
                    node: '=npRsearchNodeSimple'
                },
                template: templates['np-rsearch-node-simple'],
                link: function(scope, element, attrs){
                }
            };
        }])
        //
        .directive('npRsearchNodePlain', ['$rootScope', function($rootScope) {
            return {
                restrict: 'A',
                scope: {
                    node: '=npRsearchNodePlain'
                },
                template: templates['np-rsearch-node-plain'],
                link: function(scope, element, attrs){
                    scope.toggleSelect = function(){
                        $rootScope.$emit('np-rsearch-node-select', scope.node, element);
                    };
                }
            };
        }])
        //
        .directive('npRsearchNodeRelationsCounts', ['$rootScope', function($rootScope) {
            return {
                restrict: 'A',
                scope: false, // require <node>
                template: templates['np-rsearch-node-relations-counts'],
                link: function(scope, element, attrs){
                    scope.countClick = function(node, direction, relationType){
                        $rootScope.$emit('np-rsearch-node-relations-counts-count-click', node, direction, relationType);
                    };
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
                }
            };
        }])
        //
        .directive('npRsearchNavigationBreadcrumb', ['$rootScope', function($rootScope) {
            return {
                restrict: 'A',
                scope: {
                    breadcrumb: '=npRsearchNavigationBreadcrumb',
                    last: '=npRsearchNavigationBreadcrumbLast'
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
        .factory('npRsearchViews', ['$log', '$compile', '$timeout', '$window', function($log, $compile, $timeout, $window){

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
                    remove: function(){
                        element.remove();
                        scope.$destroy();
                    },
                    show: function(){
                        element.show();
                    },
                    hide: function(){
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
                        nextPageHandler     = null;

                    _.extend(view, {
                        reset: function(nodeList, noMore, pageHandler){
                            scope.nodeList = nodeList;

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
                                    scrollTop: nodeElement.offset().top
                                }, 200);
                            });
                        }
                    });

                    _.extend(scope, {
                        nodeList: null,
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
                        }
                    });

                    return view;
                }
            };
        }]);
    //
});
