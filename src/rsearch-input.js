/**
 * @module rsearch-input
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('less!./styles/rsearch-input');
    var template        = require('text!./views/rsearch-input.html');

                          require('jquery');
                          require('underscore');
    var i18n            = require('i18n'),
        angular         = require('angular');

    return angular.module('np.rsearch-input', [])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('npRsearchInput', ['$log', function($log){
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
                    _.extend(scope, {
                        text: 'налпоинтер',//null,

                        // TODO
                        searchInputEnter: function(){
                            fireRefresh();
                        },

                        searchBtnClick: function(){
                            fireRefresh();
                        }
                    });

                    scope.$watch('text', function(newValue, oldValue) {
                        // Не всегда (newValue != oldValue), например, при инициализации scope.
                        // Поэтому приходится сравнивать, чтобы исключить ложные срабатывания.
                        if (newValue !== oldValue) {
                            fireRefresh();
                        }
                    });

                    //
                    function fireRefresh() {
                        scope.$emit('np-rsearch-input-refresh', scope.text);
                    }

                    //
                    scope.$emit('np-rsearch-input-ready', element);
                }]
            };
        }]);
    //
});
