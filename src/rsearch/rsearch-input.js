/**
 * @module rsearch-input
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var template        = require('text!./views/rsearch-input.html');

                          require('jquery');
                          require('lodash');
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
                scope: {
                    npRsearchInputUrlWatch: '=',
                    npRsearchInputFocusable: '='
                },
                link: function(scope, element, attrs) {

                    var urlWatch        = _.isString(scope.npRsearchInputUrlWatch) || _.isBoolean(scope.npRsearchInputUrlWatch) ? scope.npRsearchInputUrlWatch : 'q',
                        focusable       = _.isBoolean(scope.npRsearchInputFocusable) ? scope.npRsearchInputFocusable : true,
                        inputElement    = element.find('input');

                    inputElement.bind('keydown', function(e){
                        // Отключить дефолтное поведение
                        if (e.keyCode === 13) {
                            return false;
                        }
                    });

                    //
                    _.extend(scope, {
                        text: null,
                        initiator: null,

                        searchInputFocus: function(){
                            $rootScope.$emit('np-rsearch-input-focus', scope.text);
                        },

                        searchInputBlur: function(){
                            $rootScope.$emit('np-rsearch-input-blur', scope.text);
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

                    $rootScope.$on('np-rsearch-input-set-text', function(e, text, initiator){
                        scope.initiator = (scope.text === text ? null : initiator);
                        scope.text = text;
                    });

                    //
                    function fireRefresh() {
                        $rootScope.$emit('np-rsearch-input-refresh', scope.text, scope.initiator);
                        scope.initiator = null;
                    }

                    //
                    $timeout(function(){
                        var locationSearch  = purl().param(),
                            q               = locationSearch[urlWatch];

                        if (q) {
                            // Поиск из URL
                            scope.text = q;
                        } else if (focusable) {
                            // Фокус на поиске
                            inputElement.focus();
                        }
                    });
                }
            };
        }]);
    //
});
