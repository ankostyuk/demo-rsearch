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


    //
    var templates = {
        'np-rsearch-node-simple':               require('text!./views/rsearch-node-simple.html'),
        'np-rsearch-node-plain':                require('text!./views/rsearch-node-plain.html'),
        'np-rsearch-navigation-breadcrumb':     require('text!./views/rsearch-navigation-breadcrumb.html'),
        'np-rsearch-node-list':                 require('text!./views/rsearch-node-list.html'),
        'np-rsearch-node-form':                 require('text!./views/rsearch-node-form.html')
    };

    return angular.module('np.rsearch-views', [])
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
        .directive('npRsearchNodePlain', [function() {
            return {
                restrict: 'A',
                scope: {
                    node: '=npRsearchNodePlain'
                },
                template: templates['np-rsearch-node-plain'],
                link: function(scope, element, attrs){
                    scope.toggleSelect = function(){
                        scope.$emit('np-rsearch-node-select', scope.node);
                    };
                }
            };
        }])
        //
        .directive('npRsearchNavigationBreadcrumb', [function() {
            return {
                restrict: 'A',
                scope: {
                    breadcrumb: '=npRsearchNavigationBreadcrumb'
                },
                template: templates['np-rsearch-navigation-breadcrumb'],
                link: function(scope, element, attrs){
                    scope.go = function(){
                        scope.$emit('np-rsearch-navigation-breadcrumb-go', scope.breadcrumb);
                    };
                }
            };
        }])
        //
        .factory('npRsearchViews', ['$log', '$compile', 'npRsearchConfig', function($log, $compile, npRsearchConfig){

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
                    }
                };
            }

            //
            return {

                createNodeListView: function(parent, parentScope) {
                    var view    = createView('np-rsearch-node-list', parent, parentScope),
                        scope   = view.scope;

                    _.extend(view, {
                        setList: function(nodeList){
                            scope.nodeList = nodeList;
                        }
                    });

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
