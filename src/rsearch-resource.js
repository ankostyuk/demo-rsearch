/**
 * @module rsearch-resource
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var angular = require('angular');

                  require('./rsearch-meta');

    return angular.module('np.rsearch-resource', [])
        //
        .factory('npRsearchResource', ['$log', '$q', '$http', 'npRsearchConfig', 'npRsearchMetaHelper', function($log, $q, $http, npRsearchConfig, npRsearchMetaHelper){

            var config = npRsearchConfig.resource || {};

            function request(httpConfig) {
                var canceler = $q.defer();

                var promise = $http(_.extend({
                    timeout: canceler.promise
                }, httpConfig));

                return {
                    canceler: canceler,
                    promise: promise
                };
            }

            return {
                search: function(options) {

                    return request({
                        method: 'GET',
                        url: config.searchUrl + '/COMPANY',
                        params: {
                            q: options.q
                        }
                    });
                }
            };
        }]);
    //
});
