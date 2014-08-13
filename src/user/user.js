/**
 * @module user
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('jquery');
                  require('underscore');
    var angular = require('angular');

                  require('resource');

    return angular.module('np.user', ['np.resource'])
        //
        .factory('npUser', ['$log', '$rootScope', '$interval', 'npResource', 'appConfig', function($log, $rootScope, $interval, npResource, appConfig){

            var resourceConfig = appConfig.resource || {};

            //
            var user            = undefined,
                pollingInterval = 60000, // 1 минута
                userRequest, loginRequest, logoutRequest;

            function applyUser(u) {
                user = u;
            }

            //
            function userLimitsResource(options) {
                return npResource.request({
                    method: 'GET',
                    url: resourceConfig['users.url'] + '/me/limits'
                }, null, options);
            }

            function loginResource(options) {
                return npResource.request({
                    method: 'POST',
                    url: resourceConfig['login.url'],
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    data: $.param(options.loginData)
                }, null, options);
            }

            function logoutResource(options) {
                return npResource.request({
                    method: 'GET',
                    url: resourceConfig['logout.url']
                }, null, options);
            }

            //
            function fetchUser() {
                userRequest = userLimitsResource({
                    previousRequest: userRequest,
                    success: function(data){
                        applyUser(data);
                    },
                    error: function(){
                        applyUser(null);
                    }
                });

                return userRequest;
            }

            function login(loginData, success, error) {
                if (logoutRequest) {
                    logoutRequest.abort();
                }

                loginRequest = loginResource({
                    loginData: loginData,
                    previousRequest: loginRequest,
                    success: function(data){
                        if (data.error) {
                            error(data);
                        } else {
                            fetchUser().promise.then(
                                function(){
                                    success();
                                },
                                function(){
                                    error(null);
                                }
                            );
                        }
                    },
                    error: function(){
                        error(null);
                    }
                });
            }

            function logout(success, error) {
                if (userRequest) {
                    userRequest.abort();
                }

                if (loginRequest) {
                    loginRequest.abort();
                }

                logoutRequest = logoutResource({
                    previousRequest: logoutRequest,
                    success: function(){
                        applyUser(null);
                        success();
                    },
                    error: error
                });
            }

            function polling() {
                fetchUser();

                $interval(function(){
                    if (userRequest && userRequest.isComplete()) {
                        fetchUser();
                    }
                }, pollingInterval);
            }

            //
            polling();

            // API
            return {

                user: function() {
                    return {
                        isFetch: function() {
                            return user !== undefined;
                        },

                        isAuthenticated: function() {
                            return !!user;
                        },

                        getName: function() {
                            return user && user.userName;
                        },

                        getBalance: function() {
                            return user && user.balance;
                        },

                        getProductLimitsInfo: function(productName) {
                            var me = this;

                            if (!me.isAuthenticated()) {
                                return null;
                            }

                            return user.limits[productName];
                        },

                        isProductAvailable: function(productName) {
                            var me = this;

                            if (!me.isAuthenticated()) {
                                return false;
                            }

                            var productLimitsInfo = me.getProductLimitsInfo(productName);

                            if (!productLimitsInfo) {
                                return false;
                            }

                            if (productLimitsInfo['unlimited'] ||
                                    productLimitsInfo['amount'] > 0 ||
                                    productLimitsInfo['price'] <= user.balance) {
                                return true;
                            }

                            return false;
                        }
                    };
                },

                fetchUser: function() {
                    return fetchUser().promise;
                },

                login: login,
                logout: logout
            };
        }]);
    //
});