/**
 * @module rsearch-meta
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
// TODO объеденить код со "связями"
define(function(require) {'use strict';

                  require('underscore');
    var angular = require('angular');

    return angular.module('np.rsearch-meta', [])
        //
        .constant('npRsearchMeta', {
            nodeTypes: {
                'COMPANY': {
                    searchResultPriority: 4
                },
                'INDIVIDUAL': {
                    searchResultPriority: 3
                },
                'ADDRESS': {
                    searchResultPriority: 2
                },
                'PHONE': {
                    searchResultPriority: 1
                }
            },
            relationTypes: {
                'FOUNDER_COMPANY': {
                    mergedPriority: 9
                },
                'FOUNDER_INDIVIDUAL': {
                    mergedPriority: 8
                },
                'HEAD_COMPANY': {
                    mergedPriority: 7
                },
                'EXECUTIVE_COMPANY': {
                    mergedPriority: 6
                },
                'EXECUTIVE_INDIVIDUAL': {
                    mergedPriority: 5
                },
                'PREDECESSOR_COMPANY': {
                    mergedPriority: 4
                },
                'REGISTER_HOLDER': {
                    mergedPriority: 3
                },
                'ADDRESS': {
                    mergedPriority: 2
                },
                'PHONE': {
                    mergedPriority: 1
                }
            }
        })
        //
        .factory('npRsearchMetaHelper', ['$log', '$q', '$http', '$rootScope', 'npRsearchConfig', 'npRsearchMeta', function($log, $q, $http, $rootScope, npRsearchConfig, npRsearchMeta){
            var resourceConfig = npRsearchConfig.resource || {};

            // init meta
            // TODO init user info
            var nodeTypesMeta       = {},
                relationTypesMeta   = {},
                nodeTypes, relationTypes;

            var nodeTypesPromise = $http({
                    method: 'GET',
                    url: resourceConfig.metaUrl + '/node/types'
                })
                .success(function(data){
                    nodeTypes = data;
                });

            var relationTypesPromise = $http({
                    method: 'GET',
                    url: resourceConfig.metaUrl + '/relation/types'
                })
                .success(function(data){
                    relationTypes = data;
                });

            $q.all([nodeTypesPromise, relationTypesPromise])
                .then(initMeta, initMeta); // !При конструкции ['finally'](initMeta) - генерятся исключения, но не отображаются в консоли

            function initMeta() {
                if (!nodeTypes || !relationTypes) {
                    throw new Error('fail init meta');
                    return;
                }

                _.each(nodeTypes, function(nodeType){
                    nodeTypesMeta[nodeType.name] = _.extend(
                        {},
                        nodeType,
                        npRsearchMeta.nodeTypes[nodeType.name]
                    );
                });

                _.each(relationTypes, function(relationType){
                    relationTypesMeta[relationType.name] = _.extend(
                        {},
                        relationType,
                        npRsearchMeta.relationTypes[relationType.name]
                    );
                });

                $rootScope.$emit('np-rsearch-meta-ready');
            }

            // API
            var metaHelper = {

                getNodeTypes: function() {
                    return nodeTypesMeta;
                },

                getRelationTypes: function() {
                    return relationTypesMeta;
                },

                buildNodeUID: function(node){
                    node.__uid = node.$$hashKey = node.__uid || metaHelper.buildNodeUIDByType(node._id, node._type);
                    return node.__uid;
                },

                buildNodeUIDByType: function(id, type){
                    return ('node-' + type + '-' + id);
                },

                buildNodeExtraMeta: function(node){
                    if (!node) {
                        return;
                    }

                    // uid
                    metaHelper.buildNodeUID(node);

                    // компания
                    if (node._type === 'COMPANY') {
                        // юридическое состояние
                        var egrulState  = node.egrul_state,
                            aliveCode   = 5, // Действующее
                            _liquidate;

                        if (egrulState && egrulState.code != aliveCode) {
                            _liquidate = {
                                state: {
                                    _actual: egrulState._actual,
                                    _since: egrulState._since,
                                    type: egrulState.type
                                }
                            };
                        } else
                        if (node.dead_dt) {
                            _liquidate = {
                                state: {
                                    _actual: null,
                                    _since: node.dead_dt,
                                    type: 'Ликвидировано' // TODO l10n|messages
                                }
                            };
                        }

                        node._liquidate = _liquidate;
                    }
                },

                buildRelationMap: function(node) {
                    var relationMap = {};

                    _.each(node._relations, function(relation){
                        var relationType    = relationTypesMeta[relation._type],
                            srcNodeUID      = metaHelper.buildNodeUIDByType(relation._srcId, relationType.sourceNodeType),
                            dstNodeUID      = metaHelper.buildNodeUIDByType(relation._dstId, relationType.destinationNodeType);

                        _.each([[srcNodeUID, 'parents'], [dstNodeUID, 'children']], function(conf){
                            var nodeUID     = conf[0],
                                direction   = conf[1];

                            // Только связи с другими нодями и "кольцевые" связи
                            if (nodeUID === node.__uid && srcNodeUID !== dstNodeUID) {
                                return;
                            }

                            var relationInfo = relationMap[nodeUID] || {
                                'parents': [],
                                'children': []
                            };

                            relationInfo[direction].push(relation);

                            relationMap[nodeUID] = relationInfo;
                        });
                    });

                    // sort
                    _.each(relationMap, function(relationInfo){
                        _.each(['parents', 'children'], function(direction){
                            relationInfo[direction] = _.sortBy(relationInfo[direction], function(relation){
                                return -relationTypesMeta[relation._type].mergedPriority;
                            });
                        });
                    });

                    return relationMap;
                }
            };

            return metaHelper;
        }])
        //
        .filter('isLastSalesVolume', ['npRsearchConfig', function(npRsearchConfig){
            return function(node){
                if (!node) {
                    return null;
                }

                return _.has(node, npRsearchConfig.meta.lastSalesVolumeField);
            };
        }])
        //
        .filter('lastSalesVolume', ['npRsearchConfig', function(npRsearchConfig){
            return function(node){
                if (!node) {
                    return null;
                }

                return node[npRsearchConfig.meta.lastSalesVolumeField] / npRsearchConfig.meta.currencyOrder;
            };
        }])
        //
        .filter('isBalance', [function(){
            return function(node){
                return node && node['balance'];
            };
        }])
        //
        .filter('balance', [function(){
            return function(node){
                if (!node) {
                    return null;
                }

                var value = node['balance'];

                if (!value) {
                    return null;
                }

                var years = _.isArray(value) ? _.clone(value) : [value];
                years.reverse();

                var formYear = node['balance_forms_' + _.last(years)];

                var forms = _.isArray(formYear) ? formYear : [formYear];

                return years.join(', ') + ' [' + forms.join(', ') + ']';
            };
        }])
        //
        .filter('OKVED', [function(){
            return function(node){
                if (!node) {
                    return null;
                }

                var okved = node['okvedcode_bal'] || node['okvedcode_main'];

                if (!okved) {
                    return null;
                }

                var okvedCode = _.chop(okved, 2).join('.');
                var okvedText = node['okved_bal_text'] || node['okved_main_text'];

                return okvedCode + ' ' + okvedText;
            };
        }]);
    //
});
