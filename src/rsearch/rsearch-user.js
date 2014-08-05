/**
 * @module rsearch-user
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('underscore');
    var angular = require('angular');

    return angular.module('np.rsearch-user', [])
        //
        .factory('npRsearchUser', ['$log', '$rootScope', 'npRsearchResource', function($log, $rootScope, npRsearchResource){

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

                fetchUser: function() {
                    var userLimitsRequest = npRsearchResource.userLimits({
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
