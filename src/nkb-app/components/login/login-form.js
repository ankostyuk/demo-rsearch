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

    return angular.module('app.user.login-form', ['np.user'])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('appLoginForm', ['$log', '$http', '$rootScope', 'npUser', 'appConfig', function($log, $http, $rootScope, npUser, appConfig){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                link: function(scope, element, attrs) {

                    var resourceConfig = appConfig.resource || {};

                    var user        = npUser.user(),
                        formData    = {};

                    var loginInfo = {
                        pending: false,
                        hasError: false,
                        errorMessage: null
                    };

                    _.extend(scope, {
                        user: user,
                        formData: formData,
                        loginInfo: loginInfo,

                        reset: function() {
                            loginInfo.hasError = false;
                            loginInfo.errorMessage = null;
                        },

                        login: function(e) {
                            e.preventDefault();
                            e.stopPropagation();

                            if (loginInfo.pending) {
                                return;
                            }

                            loginInfo.pending = true;

                            npUser.login(
                                formData,
                                function(){
                                    loginInfo.pending = false;
                                    loginInfo.hasError = false;
                                    loginInfo.errorMessage = null;
                                },
                                function(data){
                                    loginInfo.pending = false;
                                    loginInfo.hasError = true;
                                    loginInfo.errorMessage = data && data.error;
                                }
                            );
                        },

                        logout: function() {
                            loginInfo.pending = true;

                            npUser.logout(
                                function(){
                                    loginInfo.pending = false;
                                },
                                function(data){
                                    loginInfo.pending = false;
                                }
                            );
                        }
                    });
                }
            };
        }]);
    //
});
