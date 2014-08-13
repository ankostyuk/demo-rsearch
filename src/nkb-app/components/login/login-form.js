/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var template        = require('text!./views/login-form.html');

                          require('jquery');
                          require('underscore');
    var i18n            = require('i18n'),
        angular         = require('angular');

    return angular.module('app.user.login-form', [])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('appLoginForm', ['$log', '$http', '$rootScope', 'appConfig', function($log, $http, $rootScope, appConfig){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                link: function(scope, element, attrs) {

                    var resourceConfig = appConfig.resource || {};

                    var formData = {};

                    var loginInfo = {
                        pending: false,
                        hasError: false,
                        errorMessage: null
                    };

                    _.extend(scope, {
                        userInfo: null,
                        formData: formData,
                        loginInfo: loginInfo,

                        reset: function() {
                            loginInfo.hasError = false;
                            loginInfo.errorMessage = null;
                        },

                        login: function(e) {
                            loginInfo.pending = true;

                            $http({
                                method: 'POST',
                                url: resourceConfig['login.url'],
                                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                                data: $.param(formData)
                            })
                            .success(function(data, status){
                                loginInfo.pending = false;
                                loginInfo.hasError = !!data.error;
                                loginInfo.errorMessage = data.error;

                                applyUser(data);
                            })
                            .error(function(data, status){
                                loginInfo.pending = false;
                                loginInfo.hasError = true;
                                loginInfo.errorMessage = null;

                                applyUser(null);
                            });

                            e.preventDefault();
                            e.stopPropagation();
                        },

                        logout: function() {
                            $http({
                                method: 'GET',
                                url: resourceConfig['logout.url']
                            })
                            .success(function(data, status){
                                $log.log('logout success...', data, status);
                                applyUser(null);
                            })
                            .error(function(data, status){
                                $log.log('logout error...', data, status);
                            });
                        }
                    });

                    function applyUser(data) {
                        data = data || {};

                        scope.userInfo = {
                            userId: data.userId,
                            userName: data.userName,
                            balance: data.balance
                        };
                    }

                    // TODO проверить логин
                    applyUser(null);
                }
            };
        }]);
    //
});
