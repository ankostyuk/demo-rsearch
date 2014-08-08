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
        .factory('npRsearchResource', ['$log', '$q', '$http', '$injector', 'npRsearchConfig', function($log, $q, $http, $injector, npRsearchConfig){

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
                var npRsearchMetaHelper = $injector.get('npRsearchMetaHelper'),
                    baseIndex           = data.pageSize * (data.pageNumber - 1);

                _.each(data.list, function(node, i){
                    npRsearchMetaHelper.buildNodeExtraMeta(node);
                    node.__index = baseIndex + i;
                });

                return data;
            }

            // API
            return {

                userLimits: function(options) {
                    return request({
                        method: 'GET',
                        url: config['users.url'] + '/me/limits'
                    }, null, options);
                },

                nodeTypes: function(options) {
                    return request({
                        method: 'GET',
                        url: config['meta.url'] + '/node/types'
                    }, null, options);
                },

                relationTypes: function(options) {
                    return request({
                        method: 'GET',
                        url: config['meta.url'] + '/relation/types'
                    }, null, options);
                },

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
                        method: 'GET',
                        url: config['egrul.history.url'],
                        params: {
                            'inn': options.node.inn,
                            'ogrn': options.node.ogrn
                        }
                    }, {
                        responseProcess: function(data){
                            if (!_.isObject(data)) {
                                return [];
                            }

                            var egrulList = [];

                            _.each(data, function(egrul, key){
                                if (egrul.ogrn && egrul.fileDate) {
                                    egrul['_link']          = config['nkb.file.download.url'] + '?id=' + key;
                                    egrul['_downloadName']  = egrul.ogrn + '.' + egrul.fileFormat;

                                    egrulList.push(egrul);
                                }
                            });

                            egrulList = _.sortBy(egrulList, function(egrul){
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
