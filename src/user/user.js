/**
 * @module user
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('underscore');
    var angular = require('angular');

                  require('resource');

    return angular.module('np.user', ['np.resource'])
        //
        .factory('npUser', ['$log', '$rootScope', 'npResource', 'appConfig', function($log, $rootScope, npResource, appConfig){

            var resourceConfig = appConfig.resource || {};

            //
            var user = null,
                userLimitsRequest;

            function applyUser(u) {
                user = u;
            }

            // API
            return {

                user: function() {
                    return {
                        isAuthenticated: function() {
                            return !!user;
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

                userLimitsRequest: function(options) {
                    return npResource.request({
                        method: 'GET',
                        url: resourceConfig['users.url'] + '/me/limits'
                    }, null, options);
                },

                fetchUser: function() {
                    var userLimitsRequest = this.userLimitsRequest({
                        previousRequest: userLimitsRequest,
                        success: function(data){
                            applyUser(data);
                        },
                        error: function(){
                            applyUser(null);
                        }
                    });

                    return userLimitsRequest;
                }
            };
        }]);
    //
});
