/**
 * @module rsearch-resource
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular');

                  require('np.resource');
                  require('./rsearch-meta');

    return angular.module('np.rsearch-resource', ['np.resource'])
        //
        .factory('npRsearchResource', ['$log', '$q', '$http', '$injector', 'appConfig', 'npResource', 'npConnectionsListsResource', function($log, $q, $http, $injector, appConfig, npResource, npConnectionsListsResource){

            var config = appConfig.resource || {};

            // <<< remove when resolved https://github.com/newpointer/relations/issues/17
            var nodesListsRequestData;

            function nodesLists(nodeType, nodesCollection) {
                if (!(nodeType === 'COMPANY' || nodeType === 'INDIVIDUAL') || _.isEmpty(nodesCollection)) {
                    return;
                }

                nodesListsRequestData = [];

                _.each(nodesCollection, function(node){
                    nodesListsRequestData.push({
                        type: node._type,
                        id: node._id
                    });
                });

                npConnectionsListsResource.nodesLists({
                    data: nodesListsRequestData,
                    success: function(data) {
                        _.each(data, function(userLists, i){
                            _.set(nodesCollection[i], '_connections.userLists', userLists);
                        });
                    },
                    error: function() {
                        //
                    },
                    previousRequest: null
                });
            }
            // >>>

            function nodeListProcess(data, nodeIterator, requestOptions) {
                var npRsearchMetaHelper = $injector.get('npRsearchMetaHelper'),
                    baseIndex           = data.pageSize * (data.pageNumber - 1);

                _.each(data.list, function(node, i){
                    npRsearchMetaHelper.buildNodeExtraMeta(node);
                    node.__index = baseIndex + i;

                    if (_.isFunction(nodeIterator)) {
                        nodeIterator(node, i);
                    }
                });

                return data;
            }

            // API
            return {

                nodeTypes: function(options) {
                    return npResource.request({
                        method: 'GET',
                        url: config['meta.url'] + '/node/types'
                    }, null, options);
                },

                relationTypes: function(options) {
                    return npResource.request({
                        method: 'GET',
                        url: config['meta.url'] + '/relation/types'
                    }, null, options);
                },

                search: function(options) {
                    var params = _.extend({}, options.filter, options.pageConfig, {
                        q: options.q
                    });

                    return npResource.request({
                        method: 'GET',
                        url: config['search.url'] + '/' + options.nodeType,
                        params: params
                    }, {
                        // responseProcess: nodeListProcess
                        // <<< remove when resolved https://github.com/newpointer/relations/issues/17
                        responseProcess: function(data) {
                            nodesLists(_.get(data.list, '[0]._type'), data.list);
                            return nodeListProcess(data);
                        }
                        // >>>
                    }, options);
                },

                relations: function(options) {
                    function buildUrl(relationType) {
                        return config['relations.url'] + '/' + options.node._id + '/' + relationType + '/' + options.direction;
                    }

                    var params = _.extend({}, options.filter, options.pageConfig);

                    if (_.size(options.relationTypes) === 1) {
                        return npResource.request({
                            method: 'GET',
                            url: buildUrl(options.relationTypes[0]),
                            params: params
                        }, {
                            // responseProcess: nodeListProcess
                            // <<< remove when resolved https://github.com/newpointer/relations/issues/17
                            responseProcess: function(data) {
                                nodesLists(_.get(data.list, '[0]._type'), data.list);
                                return nodeListProcess(data);
                            }
                            // >>>
                        }, options);
                    }

                    // joint relations
                    var httpConfigs = {},
                        request;

                    _.each(options.relationTypes, function(relationType){
                        httpConfigs[relationType] = {
                            method: 'GET',
                            url: buildUrl(relationType),
                            params: params
                        };
                    });

                    function merge(requests) {
                        var data = {
                            pageNumber: 1,
                            pageCount: 0,
                            total: 0,
                            list: [],
                            info: {}, // TODO merge info
                            firstNumber: null,
                            lastNumber: null,
                            pageSize: null
                        };

                        _.each(options.relationTypes, function(relationType){
                            var responseData = requests[relationType].response.data;

                            // <<< remove when resolved https://github.com/newpointer/relations/issues/17
                            nodesLists(_.get(responseData.list, '[0]._type'), responseData.list);
                            // >>>
                            nodeListProcess(responseData, null, options);

                            data.total += responseData.total;

                            data.list.push({
                                key: relationType,
                                direction: options.direction,
                                data: responseData
                            });
                        });

                        return data;
                    }

                    return npResource.multiRequest(httpConfigs, null, _.extend({}, options, {
                        success: function(requests){
                            if (_.isFunction(options.success)) {
                                var data = merge(requests);
                                options.success(data, null);
                            }
                        },
                        error: function(requests){
                            if (_.isFunction(options.error)) {
                                options.error(null, null);
                            }
                        }
                    }));
                },

                kinsmen: function(options) {
                    var params = _.extend({}, options.pageConfig);

                    return npResource.request({
                        method: 'GET',
                        url: config['relations.url'] + '/INDIVIDUAL/' + options.node.name + '/kinsmen',
                        params: params
                    }, {
                        responseProcess: function(data) {
                            // <<< remove when resolved https://github.com/newpointer/relations/issues/17
                            nodesLists('INDIVIDUAL', data.list);
                            // >>>
                            return nodeListProcess(data, options.nodeIterator);
                        }
                    }, options);
                },

                relatedKinsmen: function(options) {
                    var params = _.extend({}, options.filter, {
                        individualId: options.node._id
                    });

                    return npResource.request({
                        method: 'GET',
                        url: config['algo.url'] + '/kinsmen',
                        params: params
                    }, {
                        // <<< remove when resolved https://github.com/newpointer/relations/issues/17
                        responseProcess: function(data) {
                            nodesLists('INDIVIDUAL', data.nodes);
                            return data;
                        }
                        // >>>
                    }, options);
                },

                beneficiary: function(options) {
                    var params = _.extend({}, options.filter, {
                        companyId: options.node._id
                    });

                    return npResource.request({
                        method: 'GET',
                        url: config['algo.url'] + '/individualBeneficiary',
                        params: params
                    }, {
                        // <<< remove when resolved https://github.com/newpointer/relations/issues/17
                        responseProcess: function(data) {
                            nodesLists('COMPANY', data.nodes);
                            return data;
                        }
                        // >>>
                    }, options);
                },

                traces: function(options) {
                    var params = _.extend({}, options.filter);

                    return npResource.request({
                        method: 'GET',
                        url: config['relations.url'] + '/' +
                            options.node1._type + '/' + options.node1._id +
                            '/trace/' +
                            options.node2._type + '/' + options.node2._id,
                        params: params
                    }, {
                        // <<< remove when resolved https://github.com/newpointer/relations/issues/17
                        responseProcess: function(data) {
                            nodesLists('COMPANY', data.nodes);
                            return data;
                        }
                        // >>>
                    }, options);
                },

                egrulList: function(options) {
                    return npResource.request({
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
