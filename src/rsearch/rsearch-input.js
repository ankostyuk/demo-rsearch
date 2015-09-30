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
                        inputElement    = element.find('input'),
                        isKeyboard      = false,
                        keyboardDelay   = 1000, // 1 секунда, среднее между 4-мя "опрошенными": (2000 + 1000 + 750 + 300 ) / 4 = 1012,5
                        keyboardPromise = null;

                    inputElement
                        .bind('keydown', function(e){
                            isKeyboard = !(e.keyCode === 13 || e.ctrlKey|| e.metaKey);
                        })
                        .bind('keyup', function(e){
                            if (e.keyCode === 13) {
                                fireRefresh('SEARCH_INPUT');
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
                            fireRefresh('SEARCH_BUTTON');
                        }
                    });

                    scope.$watch('text', function(newValue, oldValue) {
                        // Не всегда (newValue != oldValue), например, при инициализации scope.
                        // Поэтому приходится сравнивать, чтобы исключить ложные срабатывания.
                        if (newValue !== oldValue) {
                            fireRefresh('SEARCH_INPUT');
                        }
                    });

                    $rootScope.$on('np-rsearch-input-set-text', function(e, text, initiator){
                        scope.initiator = (scope.text === text ? null : initiator);
                        scope.text = text;
                    });

                    //
                    function fireRefresh(ui) {
                        $timeout.cancel(keyboardPromise);

                        if (isKeyboard) {
                            keyboardPromise = $timeout(function(){
                                doRefresh(ui);
                            }, keyboardDelay);
                        } else {
                            doRefresh(ui);
                        }

                        isKeyboard = false;
                    }

                    function doRefresh(ui) {
                        $rootScope.$emit('np-rsearch-input-refresh', scope.text, scope.initiator, ui);
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
