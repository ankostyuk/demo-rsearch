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
        'rsearch-node-simple':              require('text!./views/rsearch-node-simple.html'),
        'rsearch-node-plain':               require('text!./views/rsearch-node-plain.html'),
        'rsearch-navigation-breadcrumb':    require('text!./views/rsearch-navigation-breadcrumb.html'),
        'rsearch-node-list':                require('text!./views/rsearch-node-list.html'),
        'rsearch-node-form':                require('text!./views/rsearch-node-form.html')
    };

    return angular.module('np.rsearch-views', [])
        //
        .run([function(){
            _.each(templates, function(template, name){
                templates[name] = i18n.translateTemplate(template);
            });
        }])
        //
        .directive('rsearchNodeSimple', [function() {
            return {
                restrict: 'A',
                scope: {
                    node: '=rsearchNodeSimple'
                },
                template: templates['rsearch-node-simple'],
                link: function(scope, element, attrs){
                }
            };
        }])
        //
        .directive('rsearchNodePlain', [function() {
            return {
                restrict: 'A',
                scope: {
                    node: '=rsearchNodePlain'
                },
                template: templates['rsearch-node-plain'],
                link: function(scope, element, attrs){
                    scope.toggleSelect = function(){
                        scope.$emit('np.rsearch.node-select', scope.node);
                    };
                }
            };
        }])
        //
        .directive('rsearchNavigationBreadcrumb', [function() {
            return {
                restrict: 'A',
                scope: {
                    breadcrumb: '=rsearchNavigationBreadcrumb'
                },
                template: templates['rsearch-navigation-breadcrumb'],
                link: function(scope, element, attrs){
                    scope.go = function(){
                        scope.$emit('np.rsearch.navigation-breadcrumb-go', scope.breadcrumb);
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
                    var view    = createView('rsearch-node-list', parent, parentScope),
                        scope   = view.scope;

                    _.extend(view, {
                        setList: function(nodeList){
                            scope.nodeList = nodeList;
                        }
                    });

                    return view;
                },

                createNodeFormView: function(parent, parentScope) {
                    var view    = createView('rsearch-node-form', parent, parentScope),
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
