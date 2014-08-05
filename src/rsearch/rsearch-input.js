/**
 * @module rsearch-input
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var template        = require('text!./views/rsearch-input.html');

                          require('jquery');
                          require('underscore');
    var i18n            = require('i18n'),
        purl            = require('purl'),
        angular         = require('angular');

    return angular.module('np.rsearch-input', [])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('npRsearchInput', ['$log', '$rootScope', '$timeout', function($log, $rootScope, $timeout){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                link: function(scope, element, attrs) {

                    var inputElement = element.find('input');

                    inputElement.bind('keydown', function(e){
                        // Отключить дефолтное поведение
                        if (e.keyCode === 13) {
                            return false;
                        }
                    });

                    //
                    _.extend(scope, {
                        text: null,

                        // TODO Реализовать
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
                        $rootScope.$emit('np-rsearch-input-refresh', scope.text);
                    }

                    //
                    $timeout(function(){
                        var locationSearch = purl().param();

                        if (locationSearch.q) {
                            // Поиск из URL
                            scope.text = locationSearch.q;
                        } else {
                            // Фокус на поиске
                            inputElement.focus();
                        }
                    });
                }
            };
        }]);
    //
});
