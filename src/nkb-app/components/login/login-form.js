/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var template        = require('text!./views/login-form.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular');

                          require('nkb.user');

    return angular.module('app.login.login-form', ['nkb.user'])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('appLoginForm', ['$log', '$http', '$rootScope', 'nkbUser', 'npL10n', function($log, $http, $rootScope, nkbUser, npL10n){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                link: function(scope, element, attrs) {

                    var user        = nkbUser.user(),
                        formData    = {};

                    var loginInfo = {
                        pending: false,
                        hasError: false,
                        errorMessage: null
                    };

                    _.extend(scope, {
                        user: user,
                        l10n: npL10n.l10n(),
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

                            nkbUser.login(
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

                            nkbUser.logout(
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
