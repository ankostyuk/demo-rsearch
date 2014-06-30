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

            function request(httpConfig, options) {
                if (options.previousRequest) {
                    options.previousRequest.abort();
                }

                var canceler = $q.defer(),
                    complete = false;

                var promise = $http(_.extend({
                    timeout: canceler.promise
                }, httpConfig));

                promise['finally'](function(){
                    complete = true;
                });

                return {
                    promise: promise,
                    abort: function(){
                        canceler.resolve();
                    },
                    isComplete: function(){
                        return complete;
                    }
                };
            }

            return {

                search: function(options) {
                    var params = _.extend({}, options.filter, options.pageConfig, {
                        q: options.q
                    });

                    return request({
                        method: 'GET',
                        url: config.searchUrl + '/' + options.nodeType,
                        params: params
                    }, options);
                },

                relations: function(options) {
                    var params = _.extend({}, options.filter, options.pageConfig);

                    return request({
                        method: 'GET',
                        url: config.relationsUrl + '/' + options.node._id + '/' + options.relationType + '/' + options.direction,
                        params: params
                    }, options);
                }
            };
        }]);
    //
});
