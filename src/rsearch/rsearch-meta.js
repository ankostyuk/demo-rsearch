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
                },
                'FOUNDER_INDIVIDUAL': {
                },
                'HEAD_COMPANY': {
                },
                'EXECUTIVE_COMPANY': {
                },
                'EXECUTIVE_INDIVIDUAL': {
                },
                'PREDECESSOR_COMPANY': {
                },
                'REGISTER_HOLDER': {
                },
                'ADDRESS': {
                },
                'PHONE': {
                }
            }
        })
        //
        .factory('npRsearchMetaHelper', ['$log', '$q', '$rootScope', 'npRsearchConfig', 'npRsearchMeta', 'npRsearchResource', function($log, $q, $rootScope, npRsearchConfig, npRsearchMeta, npRsearchResource){
            var resourceConfig = npRsearchConfig.resource || {};

            // init meta
            // TODO init user info
            var nodeTypesMeta       = {},
                relationTypesMeta   = {},
                nodeTypes, relationTypes;

            var nodeTypesPromise = npRsearchResource.nodeTypes({
                success: function(data){
                    nodeTypes = data;
                }
            }).completePromise;

            var relationTypesPromise = npRsearchResource.relationTypes({
                success: function(data){
                    relationTypes = data;
                }
            }).completePromise;

            // ! При конструкции ['finally'](...) - генерятся исключения, но не отображаются в консоли
            $q.all([nodeTypesPromise, relationTypesPromise]).then(initMeta, initMeta);

            function initMeta() {
                if (!nodeTypes || !relationTypes) {
                    throw new Error('fail init meta');
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

                    // история?
                    var matches     = node._info && node._info.matches,
                        matchesSize = _.size(matches);

                    if ((matchesSize === 1 &&
                            (_.contains(matches, 'namehistory') || _.contains(matches, 'chiefhistory'))) ||
                        (matchesSize === 2 &&
                            _.contains(matches, 'namehistory') && _.contains(matches, 'chiefhistory'))) {
                        //
                        node.__historical = {};

                        _.each(matches, function(m){
                            node.__historical[m] = true;
                        });
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
                                'parents': {},
                                'children': {}
                            };

                            relationInfo[direction][relation._type] = relation;

                            relationMap[nodeUID] = relationInfo;
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
        .filter('balanceForms', [function(){
            return function(node){
                if (!node) {
                    return null;
                }

                var value = node['balance'];

                if (!value) {
                    return null;
                }

                var years       = _.isArray(value) ? _.clone(value) : [value],
                    formYear    = node['balance_forms_' + _.first(years)],
                    forms       = _.isArray(formYear) ? formYear : [formYear];

                return forms.join(', ');
            };
        }])
        //
        .filter('balanceByPeriod', [function(){
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

                var prevYear        = years[0],
                    yearsByPeriod   = [[prevYear]],
                    p               = 0,
                    str             = '',
                    year, i;

                for (i = 1; i < years.length; i++) {
                    year = years[i];

                    if (year - prevYear === 1) {
                        yearsByPeriod[p][1] = year;
                    } else {
                        yearsByPeriod[++p] = [year];
                    }

                    prevYear = year;
                }

                for (i = 0; i < yearsByPeriod.length; i++) {
                    str += yearsByPeriod[i].join('—') + (i < yearsByPeriod.length - 1 ? ', ' : '');
                }

                return str;
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

                var okvedCode = _.chop(okved, 2).join('.'),
                    okvedText = node['okved_bal_text'] || node['okved_main_text'];

                return okvedCode + ' ' + okvedText;
            };
        }])
        //
        .filter('targetRelationsInfo', ['$filter', function($filter){
            return function(data, node){
                if (!data) {
                    return null;
                }

                var nbsp = ' ';

                var SHOW_TYPES = {
                    'FOUNDER_COMPANY': {
                        order: 101,
                        text: function(relation){
                            return getFounderText(relation);
                        }
                    },

                    'FOUNDER_INDIVIDUAL': {
                        order: 201,
                        mergedInn: true,
                        text: function(relation){
                            return getFounderText(relation);
                        }
                    },

                    'EXECUTIVE_INDIVIDUAL': {
                        order: 202,
                        mergedInn: true,
                        text: function(relation){
                            return relation.position ? relation.position : '';
                        }
                    }
                };

                // TODO i18n
                function getFounderText(relation) {
                    if (relation.sharePercent || relation.shareAmount) {
                        return 'доля' +
                            (relation.sharePercent ? nbsp + $filter('number')(relation.sharePercent) + '%' : '') +
                            (relation.shareAmount ? nbsp + $filter('number')(relation.shareAmount) + nbsp + 'руб.' : '');
                    }

                    return '';
                }

                // TODO i18n
                function getInnText(inn) {
                    return 'ИНН' + nbsp + inn;
                }

                var relations   = data.relationInfo.relationMap[node.__uid][data.relationInfo.direction],
                    list        = [],
                    text        = '',
                    inn;

                _.each(relations, function(relation, type){
                    if (SHOW_TYPES[type]) {
                        list.push(relation);
                    }
                });

                var size = _.size(list);

                if (size === 0) {
                    return null;
                }

                list = _.sortBy(list, function(relation){
                    return relation._type === data.relationInfo.relationType ? 0 : SHOW_TYPES[relation._type].order;
                });

                _.each(list, function(relation, i){
                    var showType    = SHOW_TYPES[relation._type],
                        t           = showType.text(relation);

                    text += t + (t && i < size - 1 ? ', ' : '');

                    if (showType.mergedInn) {
                        inn = relation.inn;
                    }
                });

                if (inn) {
                    text += text ? ', ' + getInnText(inn) : getInnText(inn);
                }

                return _.capitalize(text);
            };
        }]);
    //
});
