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
        .factory('npRsearchResource', ['$log', '$q', '$http', '$injector', 'appConfig', 'npResource', function($log, $q, $http, $injector, appConfig, npResource){

            var config = appConfig.resource || {};

            function nodeListProcess(data, nodeIterator) {
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
                        responseProcess: nodeListProcess
                    }, options);
                },

                relations: function(options) {
                    var params = _.extend({}, options.filter, options.pageConfig);

                    return npResource.request({
                        method: 'GET',
                        url: config['relations.url'] + '/' + options.node._id + '/' + options.relationType + '/' + options.direction,
                        params: params
                    }, {
                        responseProcess: nodeListProcess
                    }, options);
                },

                kinsmen: function(options) {
                    var params = _.extend({}, options.pageConfig);

                    return npResource.request({
                        method: 'GET',
                        url: config['relations.url'] + '/INDIVIDUAL/' + options.node.name + '/kinsmen',
                        params: params
                    }, {
                        responseProcess: function(data) {
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
                    }, null, options);
                },

                beneficiary: function(options) {
                    var params = _.extend({}, options.filter, {
                        companyId: options.node._id
                    });

                    return npResource.request({
                        method: 'GET',
                        url: config['algo.url'] + '/individualBeneficiary',
                        params: params
                    }, null, options);
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
                    }, null, options);
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
