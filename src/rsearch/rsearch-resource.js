/**
 * @module rsearch-resource
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('underscore');
    var angular = require('angular');

                  require('./rsearch-meta');

    return angular.module('np.rsearch-resource', [])
        //
        .factory('npRsearchResource', ['$log', '$q', '$http', 'npRsearchConfig', 'npRsearchMetaHelper', function($log, $q, $http, npRsearchConfig, npRsearchMetaHelper){

            var config = npRsearchConfig.resource || {};

            function request(httpConfig, requestConfig, options) {
                requestConfig = requestConfig || {};
                options = options || {};

                if (options.previousRequest) {
                    options.previousRequest.abort();
                }

                var canceler    = $q.defer(),
                    completer   = $q.defer(),
                    complete    = false;

                var promise = $http(_.extend({
                    timeout: canceler.promise
                }, httpConfig));

                promise
                    .success(function(data, status){
                        if (_.isFunction(requestConfig.responseProcess)) {
                            data = requestConfig.responseProcess(data, status);
                        }

                        if (_.isFunction(options.success)) {
                            options.success(data, status);
                        }
                    })
                    .error(function(data, status){
                        if (_.isFunction(options.error)) {
                            options.error(data, status);
                        }
                    })
                    ['finally'](function(){
                        complete = true;
                        completer.resolve();
                    });

                return {
                    promise: promise,
                    completePromise: completer.promise,
                    abort: function(){
                        canceler.resolve();
                    },
                    isComplete: function(){
                        return complete;
                    }
                };
            }

            function nodeListProcess(data) {
                var baseIndex = data.pageSize * (data.pageNumber - 1);

                _.each(data.list, function(node, i){
                    npRsearchMetaHelper.buildNodeExtraMeta(node);
                    node.__index = baseIndex + i;
                });

                return data;
            }

            // API
            return {

                search: function(options) {
                    var params = _.extend({}, options.filter, options.pageConfig, {
                        q: options.q
                    });

                    return request({
                        method: 'GET',
                        url: config['search.url'] + '/' + options.nodeType,
                        params: params
                    }, {
                        responseProcess: nodeListProcess
                    }, options);
                },

                relations: function(options) {
                    var params = _.extend({}, options.filter, options.pageConfig);

                    return request({
                        method: 'GET',
                        url: config['relations.url'] + '/' + options.node._id + '/' + options.relationType + '/' + options.direction,
                        params: params
                    }, {
                        responseProcess: nodeListProcess
                    }, options);
                },

                egrulList: function(options) {
                    return request({
                        method: 'POST',
                        url: config['egrul.list.url'],
                        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                        data: 'json=' + angular.toJson({
                            'inn': options.node.inn,
                            'ogrn': options.node.ogrn
                        })
                    }, {
                        responseProcess: function(data){
                            if (!_.isObject(data) || data['serviceError']) {
                                return [];
                            }

                            _.each(data, function(egrul, key){
                                egrul['_link']          = config['nkb.file.download.url'] + '?id=' + key;
                                egrul['_downloadName']  = egrul.ogrn + '.' + egrul.fileFormat;
                            });

                            var egrulList = _.sortBy(_.toArray(data), function(egrul){
                                return -(egrul.fileDate);
                            });

                            return egrulList;
                        }
                    }, options);
                }
            };
        }]);
    //
});
