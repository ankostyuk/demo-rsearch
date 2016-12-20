/**
 * @module rsearch-meta
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
// TODO объеденить relation/.../meta.js и rsearch-meta.js
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular'),
        i18n    = require('i18n');

    var extmodules = {
        'nkb.filters': require('nkb.filters')
    };

    return angular.module('np.rsearch-meta', _.pluck(extmodules, 'name'))
        //
        .constant('npRsearchMeta', {
            // Дополнительные свойства для нод
            nodeTypes: {
                'COMPANY': {
                    search: true,
                    searchResultPriority: 60,
                    accentedResultPriority: 0
                },
                'SELFEMPLOYED': {
                    search: true,
                    searchResultPriority: 50,
                    accentedResultPriority: 10
                },
                'INDIVIDUAL': {
                    search: true,
                    searchResultPriority: 40,
                    accentedResultPriority: 20
                },
                'ADDRESS': {
                    search: true,
                    searchResultPriority: 30,
                    accentedResultPriority: 0
                },
                'PHONE': {
                    search: true,
                    searchResultPriority: 20,
                    accentedResultPriority: 0
                },
                'PURCHASE': {
                    search: false,
                    searchResultPriority: 10,
                    accentedResultPriority: 0
                }
            },

            // Дополнительные свойства для связей
            //
            // TODO автоматическое формирование свойств для объединенных типов на основе базовых типов
            relationTypes: {
                'FOUNDER': {
                    name: 'FOUNDER',
                    'parents': {
                        order: 100,
                        top: true,
                        group: 'BASE',
                        pageSize: 'all',
                        history: {
                            opposite: false
                        }
                    }
                },

                'FOUNDER_INDIVIDUAL': {
                    'children': {
                        order: 250,
                        top: true,
                        group: 'BASE',
                        history: {
                            opposite: true
                        }
                    },
                    'parents': {
                        order: 200,
                        top: true,
                        group: 'BASE',
                        pageSize: 'all',
                        history: {
                            opposite: false
                        }
                    }
                },

                'FOUNDER_COMPANY': {
                    'children': {
                        order: 350,
                        top: true,
                        group: 'BASE',
                        history: {
                            opposite: true
                        }
                    },
                    'parents': {
                        order: 300,
                        top: true,
                        group: 'BASE',
                        pageSize: 'all',
                        history: {
                            opposite: false
                        }
                    }
                },

                'HEAD_COMPANY': {
                    'children': {
                        order: 400,
                        top: true,
                        group: 'BASE'
                    },
                    'parents': {
                        order: 450,
                        group: 'BASE'
                    }
                },

                'PREDECESSOR_COMPANY': {
                    'children': {
                        order: 550,
                        top: true,
                        group: 'BASE'
                    },
                    'parents': {
                        order: 500,
                        top: true,
                        group: 'BASE'
                    }
                },

                'REGISTER_HOLDER': {
                    'children': {
                        order: 650,
                        group: 'BASE'
                    },
                    'parents': {
                        order: 600,
                        group: 'BASE'
                    }
                },

                'EXECUTIVE_COMPANY': {
                    'children': {
                        order: 750,
                        group: 'BASE'
                    },
                    'parents': {
                        order: 700,
                        group: 'BASE'
                    }
                },

                'EXECUTIVE_INDIVIDUAL': {
                    'children': {
                        order: 850,
                        top: true,
                        group: 'BASE',
                        history: {
                            opposite: true
                        }
                    },
                    'parents': {
                        order: 800,
                        group: 'BASE',
                        pageSize: 'all',
                        history: {
                            opposite: false
                        }
                    }
                },

                'AFFILIATED_INDIVIDUAL': {
                    'children': {
                        order: 950,
                        top: true,
                        group: 'AFFILIATED'
                    },
                    'parents': {
                        order: 900,
                        top: true,
                        group: 'AFFILIATED'
                    }
                },

                'AFFILIATED_COMPANY': {
                    'children': {
                        order: 1050,
                        top: true,
                        group: 'AFFILIATED'
                    },
                    'parents': {
                        order: 1000,
                        top: true,
                        group: 'AFFILIATED'
                    }
                },

                'ADDRESS': {
                    'children': {
                        order: 1150,
                        top: true,
                        group: 'BASE'
                    },
                    'parents': {
                        order: 1100,
                        group: 'CONTACTS'
                    }
                },

                'PHONE': {
                    'children': {
                        order: 1250,
                        top: true,
                        group: 'BASE'
                    },
                    'parents': {
                        order: 1200,
                        group: 'CONTACTS'
                    }
                },

                'CUSTOMER_COMPANY': {
                    'children': {
                        order: 1300,
                        group: 'PURCHASE'
                    },
                    'parents': {
                        order: 1350,
                        top: true,
                        group: 'BASE'
                    }
                },

                'PARTICIPANT_COMPANY': {
                    'children': {
                        order: 1400,
                        group: 'PURCHASE'
                    },
                    'parents': {
                        order: 1670,
                        top: true,
                        group: 'BASE'
                    }
                },

                'EMPLOYEE': {
                    'children': {
                        order: 1720,
                        group: 'PURCHASE'
                    },
                    'parents': {
                        order: 1500,
                        group: 'PURCHASE'
                    }
                },

                'PARTICIPANT_INDIVIDUAL': {
                    'children': {
                        order: 1600,
                        group: 'PURCHASE'
                    },
                    'parents': {
                        order: 1650,
                        top: true,
                        group: 'BASE'
                    }
                },

                'COMMISSION_MEMBER': {
                    'children': {
                        order: 1700,
                        group: 'PURCHASE'
                    },
                    'parents': {
                        order: 1750,
                        group: 'BASE'
                    }
                },

                'kinsmen': {
                    name: 'kinsmen',
                    sourceNodeType: "INDIVIDUAL",
                    destinationNodeType: "INDIVIDUAL"
                }
            },

            mergedRelationTypes: {
                'FOUNDER': {
                    'parents': ['FOUNDER_INDIVIDUAL', 'FOUNDER_COMPANY']
                }
            },

            relationGroups: {
                'BASE': {
                    order: 10
                },
                'AFFILIATED': {
                    order: 20
                },
                'CONTACTS': {
                    order: 30
                },
                'PURCHASE': {
                    order: 40
                }
            }
        })
        //
        .factory('npRsearchMetaHelper', ['$log', '$window', '$q', '$rootScope', 'appConfig', 'npRsearchMeta', 'npRsearchResource', 'npConnectionsListsResource', 'nkbSelfemployedHelper', function($log, $window, $q, $rootScope, appConfig, npRsearchMeta, npRsearchResource, npConnectionsListsResource, nkbSelfemployedHelper){
            var resourceConfig = appConfig.resource || {};

            // init meta
            var initDefer = $q.defer();

            var nodeTypesMeta       = {},
                relationTypesMeta   = {},
                nodeTypes, relationTypes;

            if (resourceConfig.noInitMeta) {
                nodeTypes = $window._INTERNAL_DATA_.nodeTypes;
                relationTypes = $window._INTERNAL_DATA_.relationTypes;
                initMeta();
            } else {
                doInitMeta();
            }

            function doInitMeta() {
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
            }

            function initMeta() {
                if (!nodeTypes || !relationTypes) {
                    throw new Error('fail init meta');
                }

                // nodeTypesMeta
                _.each(nodeTypes, function(nodeType){
                    nodeTypesMeta[nodeType.name] = nodeType;
                });
                _.each(npRsearchMeta.nodeTypes, function(nodeType, nodeTypeName){
                    nodeTypesMeta[nodeTypeName] = _.extend(
                        {},
                        nodeTypesMeta[nodeTypeName],
                        nodeType
                    );
                });

                // relationTypesMeta
                _.each(relationTypes, function(relationType){
                    relationTypesMeta[relationType.name] = relationType;
                });
                _.each(npRsearchMeta.relationTypes, function(relationType, relationTypeName){
                    relationTypesMeta[relationTypeName] = _.extend(
                        {},
                        relationTypesMeta[relationTypeName],
                        relationType
                    );
                });

                //
                initDefer.resolve();
                $rootScope.$emit('np-rsearch-meta-ready');
            }

            // API
            var metaHelper = {

                // <<< remove when resolved https://github.com/newpointer/relations/issues/17
                nodesLists: function(nodeType, nodesCollection) {
                    if (!(nodeType === 'COMPANY' || nodeType === 'INDIVIDUAL') || _.isEmpty(nodesCollection)) {
                        return;
                    }

                    var nodesListsRequestData = [];

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
                },
                // >>>

                initPromise: function() {
                    return initDefer.promise;
                },

                getNodeTypes: function() {
                    return nodeTypesMeta;
                },

                getRelationTypes: function() {
                    return relationTypesMeta;
                },

                buildNodeUID: function(node) {
                    node.__uid = node.$$hashKey = node.__uid || metaHelper.buildNodeUIDByType(node._id, node._type);
                    return node.__uid;
                },

                buildNodeUIDByType: function(id, type) {
                    return ('node-' + type + '-' + id);
                },

                buildRelationId: function(relation) {
                    // relation.__uid = relation.$$hashKey = relation.__uid || (relation._srcId + '-' + relation._type + '-' + relation._dstId);
                    relation.__id = relation.__id || (relation._srcId + '-' + relation._type + '-' + relation._dstId);
                    return relation.__id;
                },

                buildNodeRelationKey: function(direction, relationType) {
                    return direction + '::' + relationType;
                },

                getNodeRelationInfoByKey: function(key) {
                    var s = key.split('::');

                    return {
                        relationDirection: s[0],
                        relationType: s[1]
                    };
                },

                buildNodeRelationPluralKey: function(direction, relationType) {
                    return 'NG_PLURALIZE::RELATION_' + relationType + '-' + direction;
                },

                buildNodeExtraMeta: function(node) {
                    if (!node) {
                        return;
                    }

                    // uid
                    metaHelper.buildNodeUID(node);

                    //
                    node.__relationData = metaHelper.buildRelationDataByNodeInfo(node);

                    //
                    node.__idField = _.get(nodeTypesMeta[node._type], 'idField');

                    // компания
                    if (node._type === 'COMPANY') {
                        metaHelper.buildCompanyState(node);
                        node.__isFavoritesSupported = true;
                    } else
                    // идентифицированные физики
                    if (node._type === 'INDIVIDUAL_IDENTITY') {
                        nkbSelfemployedHelper.buildSelfemployeNode(node);
                    } else
                    // физик
                    if (node._type === 'INDIVIDUAL') {
                        node.__isFavoritesSupported = true;
                    } else
                    // закупка
                    if (node._type === 'PURCHASE') {
                        node.currency = node.currency || appConfig.meta.defaultCurrency;
                        node.__lotMap = _.indexBy(node.lots, 'lot');
                        metaHelper.resolvePurchaseHref(node);
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

                getHistoryRelationCounts: function(node, direction, relationType) {
                    var infoDirection   = metaHelper.getInfoDirection(direction),
                        info            = node._info[infoDirection][relationType];

                    return metaHelper.getHistoryRelationCountsByInfo(info);
                },

                getHistoryRelationCountsByInfo: function(info) {
                    info = info || {};
                    return {
                        'actual': info.actual || 0,
                        'outdated': info.outdated || 0,
                        'all': (info.actual || 0) + (info.outdated || 0)
                    };
                },

                buildRelationDataByNodeInfo: function(node) {
                    var relationCountMap    = {},
                        relationCounts      = [],
                        groups              = {};

                    _.each(['in', 'out'], function(infoDirection){
                        _.each(_.get(node, ['_info', infoDirection]), function(info, relationType){
                            var historyRelationCounts   = metaHelper.getHistoryRelationCountsByInfo(info),
                                relationCount           = historyRelationCounts['all'];

                            var direction               = metaHelper.getDirection(infoDirection),
                                relationTypeMeta        = metaHelper.getRelationTypeMeta(relationType, direction),
                                groupKey                = relationTypeMeta.group,
                                relationGroupMeta       = metaHelper.getRelationGroupMeta(groupKey),
                                mergedTypeInfo          = metaHelper.getMergedTypeInfoByRelationType(relationType, direction),
                                mergedTypeKey           = mergedTypeInfo.mergedType && metaHelper.buildNodeRelationKey(direction, mergedTypeInfo.mergedType),
                                mergedTypeCountData     = relationCountMap[mergedTypeKey],
                                mergedTypeRelationCount = 0,
                                relationKey             = metaHelper.buildNodeRelationKey(direction, relationType),
                                relationPluralKey       = metaHelper.buildNodeRelationPluralKey(direction, relationType);

                            var group = groups[groupKey] = groups[groupKey] || {
                                key: groupKey,
                                order: relationGroupMeta.order,
                                relationCounts: {}
                            };

                            // TODO Объединить код с mergedTypeCountData
                            var countData = {
                                key:                    relationKey,
                                order:                  relationTypeMeta.order,
                                top:                    relationTypeMeta.top,
                                history:                relationTypeMeta.history,
                                relationType:           relationType,
                                direction:              direction,
                                relationCount:          relationCount,
                                historyRelationCounts:  historyRelationCounts,
                                pluralKey:              relationPluralKey
                            };

                            var mergedTypeHistoryRelationCounts = {
                                'actual': 0,
                                'outdated': 0,
                                'all': 0
                            };

                            _.each(!mergedTypeCountData && mergedTypeInfo.relationTypes, function(t){
                                var info    = _.get(node, ['_info', infoDirection, t]),
                                    counts  = info ? metaHelper.getHistoryRelationCountsByInfo(info) : null;

                                if (!counts) {
                                    return;
                                }

                                mergedTypeHistoryRelationCounts['actual']   += counts['actual'];
                                mergedTypeHistoryRelationCounts['outdated'] += counts['outdated'];
                                mergedTypeHistoryRelationCounts['all']      += counts['all'];

                                // mergedTypeRelationCount += counts ? counts['all'] : 0;
                            });

                            mergedTypeRelationCount = mergedTypeHistoryRelationCounts['all'];

                            if (!mergedTypeCountData && mergedTypeRelationCount > relationCount) {
                                var mergedType      = mergedTypeInfo.mergedType,
                                    mergedTypeMeta  = metaHelper.getRelationTypeMeta(mergedType, direction);

                                // TODO Объединить код с countData
                                mergedTypeCountData = {
                                    key:                    mergedTypeKey,
                                    order:                  mergedTypeMeta.order,
                                    top:                    mergedTypeMeta.top,
                                    history:                mergedTypeMeta.history,
                                    relationType:           mergedType,
                                    direction:              direction,
                                    relationCount:          mergedTypeRelationCount,
                                    historyRelationCounts:  mergedTypeHistoryRelationCounts,
                                    pluralKey:              metaHelper.buildNodeRelationPluralKey(direction, mergedType)
                                };

                                group.relationCounts[mergedTypeKey] = mergedTypeCountData;
                                relationCountMap[mergedTypeKey] = mergedTypeCountData;
                            }

                            if (!relationCountMap[mergedTypeKey]) {
                                group.relationCounts[relationKey] = countData;
                            }

                            relationCountMap[relationKey] = countData;
                        });
                    });

                    groups = _.sortBy(groups, 'order');

                    _.each(groups, function(group){
                        group.relationCounts = _.sortBy(group.relationCounts, 'order');
                        relationCounts = relationCounts.concat(group.relationCounts);
                    });

                    return {
                        relationCountMap: relationCountMap,
                        relationCounts: relationCounts,
                        groups: groups
                    };
                },

                buildRelationDataByNodeRelations: function(node, relations) {
                    var relationCountMap = {};

                    _.each(relations, function(relation){
                        var direction       = metaHelper.getDirectionByNode(node, relation),
                            relationType    = relation._type;

                        buildCountData(relationType, direction);

                        // Для объединенных типов
                        var mergedTypeInfo = metaHelper.getMergedTypeInfoByRelationType(relationType, direction);

                        if (mergedTypeInfo.mergedType) {
                            buildCountData(mergedTypeInfo.mergedType, direction);
                        }
                    });

                    function buildCountData(relationType, direction) {
                        var relationKey = metaHelper.buildNodeRelationKey(direction, relationType);

                        var countData = relationCountMap[relationKey] = relationCountMap[relationKey] || {
                            key:            relationKey,
                            relationType:   relationType,
                            direction:      direction,
                            relationCount:  0
                        };

                        countData.relationCount++;
                    }

                    return {
                        relationCountMap: relationCountMap
                    };
                },

                getRelationCountData: function(node, direction, relationType) {
                    var relationKey = metaHelper.buildNodeRelationKey(direction, relationType),
                        countData   = _.get(node, ['__relationData', 'relationCountMap', relationKey]);

                    if (countData) {
                        return countData;
                    }

                    return {
                        key:            relationKey,
                        relationType:   relationType,
                        direction:      direction,
                        relationCount:  null,
                        pluralKey:      metaHelper.buildNodeRelationPluralKey(direction, relationType)
                    };
                },

                buildCompanyState: function(node) {
                    // юридическое состояние
                    var egrulState          = node.egrul_state,
                        aliveCode           = '5', // действующее
                        intermediateCodes   = ['6', '111', '121', '122', '123', '124', '131', '132'], // коды промежуточных состояний
                        _liquidate;

                    if (egrulState) {
                        if (egrulState.code !== aliveCode) {
                            _liquidate = {
                                state: {
                                    _actual: egrulState._actual,
                                    _since: egrulState._since,
                                    type: egrulState.type,
                                    intermediate: _.contains(intermediateCodes, egrulState.code)
                                }
                            };
                        }
                    } else if (node.dead_dt) {
                        _liquidate = {
                            state: {
                                _actual: null,
                                _since: node.dead_dt,
                                type: _trc("Ликвидировано", "Состояние ЮЛ")
                            }
                        };
                    }

                    node._liquidate = _liquidate;

                    // способ организации компании
                    var egrulReg    = node.egrul_reg,
                        baseCodes   = ['100001', '100024', '210001']; // коды стандартных регистраций

                    if (egrulReg && !_.contains(baseCodes, egrulReg.code)) {
                        node._reg = {
                            state: {
                                _actual: egrulReg._actual,
                                _since: egrulReg._since,
                                type: egrulReg.type
                            }
                        };
                    }
                },

                resolvePurchaseHref: function(node) {
                    if (node.law === 'FZ_44') {
                        node.__href = node.href;
                    } else {
                        node.__href = 'http://zakupki.gov.ru/epz/order/quicksearch/search_eis.html?strictEqual=on&pageNumber=1&sortDirection=false&recordsPerPage=_10&showLotsInfoHidden=false&fz44=on&fz223=on&fz94=on&regions=&priceFrom=&priceTo=&currencyId=-1&publishDateFrom=&publishDateTo=&updateDateFrom=&updateDateTo=&sortBy=UPDATE_DATE&searchString=' + node._id;
                    }
                },

                getRelationTypeMeta: function(relationType, direction) {
                    return _.get(npRsearchMeta.relationTypes, [relationType, direction]);
                },

                getRelationTypesByMergedType: function(mergedType, direction) {
                    return _.get(npRsearchMeta.mergedRelationTypes, [mergedType, direction]);
                },

                isRelationTypeInMergedType: function(relationType, mergedType, direction) {
                    return _.contains(_.get(npRsearchMeta.mergedRelationTypes, [mergedType, direction]), relationType);
                },

                getMergedTypeInfoByRelationType: function(relationType, direction) {
                    var info = {
                        mergedType: null,
                        relationTypes: null
                    };

                    _.each(npRsearchMeta.mergedRelationTypes, function(byDirections, mergedType){
                        var relationTypes = byDirections[direction];
                        if (_.contains(relationTypes, relationType)) {
                            info.mergedType = mergedType;
                            info.relationTypes = relationTypes;
                            return false;
                        }
                    });

                    return info;
                },

                getRelationPageSize: function(relationType, direction) {
                    return _.get(relationTypesMeta, [relationType, direction, 'pageSize']);
                },

                getRelationHistoryMeta: function(relationType, direction) {
                    return _.get(relationTypesMeta, [relationType, direction, 'history']);
                },

                getInfoDirection: function(relationDirection) {
                    return relationDirection === 'parents' ? 'in' : 'out';
                },

                getDirection: function(infoDirection) {
                    return infoDirection === 'in' ? 'parents' : 'children';
                },

                getDirectionByNode: function(node, relation) {
                    return relation._dstId === node._id ? 'parents' : 'children';
                },

                getRelationGroupMeta: function(relationGroup) {
                    return npRsearchMeta.relationGroups[relationGroup];
                },

                buildNodesRelationMap: function(nodeList) {
                    _.each(nodeList, function(node){
                        metaHelper.buildNodeRelationMap(node);
                    });
                },

                buildNodeRelationMap: function(node) {
                    node.__relationMap = metaHelper.buildRelationMap(node);
                },

                buildRelationMap: function(node) {
                    var relationMap = {};

                    relationMap.relations = {};
                    relationMap.byNodes = {};

                    metaHelper.__relationsProcess(relationMap, node, node._relations);
                    metaHelper.__relationsPostProcess(relationMap, node);

                    $log.debug('buildRelationMap... relationMap:', relationMap);

                    // metaHelper.__checkRelations(node);

                    return relationMap;
                },

                addToRelationMap: function(relationMap, node, relations, options) {
                    relationMap.relations = relationMap.relations || {};
                    relationMap.byNodes = relationMap.byNodes || {};

                    metaHelper.__relationsProcess(relationMap, node, relations, options);
                    metaHelper.__relationsPostProcess(relationMap, node);

                    $log.debug('addToRelationMap... relationMap:', relationMap);
                },

                __checkRelations: function(node) {
                    var relationCount   = _.size(node._relations),
                        duplicateMap    = {};

                    _.each(node._relations, function(relation, i){
                        var relationId = metaHelper.buildRelationId(relation);

                        if (duplicateMap[relationId]) {
                            return;
                        }

                        var duplicates = [],
                            r, j;

                        for (j = i + 1; j < relationCount; j++) {
                            r = node._relations[j];

                            if (_.isEqual(relation, r)) {
                                duplicates.push(j);
                            }
                        }

                        if (!_.isEmpty(duplicates)) {
                            duplicates.splice(0, 0, i);
                            duplicateMap[relationId] = duplicates;
                        }
                    });

                    if (!_.isEmpty(duplicateMap)) {
                        var result = _.sortBy(duplicateMap, function(duplicates){
                            return duplicates[0];
                        });

                        $log.warn('Дубликаты связей...\n', JSON.stringify(result));
                        $log.warn('__checkRelations... duplicateMap:', duplicateMap);
                    }
                },

                __relationsProcess: function(relationMap, node, relations, options) {
                    options = options || {};

                    _.each(relations, function(relation){
                        var relationType    = relationTypesMeta[relation._type],
                            srcNodeUID      = metaHelper.buildNodeUIDByType(relation._srcId, relationType.sourceNodeType),
                            dstNodeUID      = metaHelper.buildNodeUIDByType(relation._dstId, relationType.destinationNodeType),
                            isSrcNode       = srcNodeUID === node.__uid,
                            relationNodeUID = options.direction ? node.__uid : (isSrcNode ? dstNodeUID : srcNodeUID),
                            direction       = options.direction ? options.direction : (isSrcNode ? 'children' : 'parents');

                        //
                        var relationId          = metaHelper.buildRelationId(relation),
                            relationExist       = !!relationMap.relations[relationId],
                            historyRelationMeta = metaHelper.getRelationHistoryMeta(relationType.name, direction),
                            r;

                        // relationMap.relations
                        if (relationExist) {
                            r = relationMap.relations[relationId].relation;
                            // смержить специфические свойства
                            r.inn = r.inn || relation.inn;
                        } else {
                            relationMap.relations[relationId] = {
                                relation: relation,
                                direction: direction
                            };
                        }

                        buildHistory();

                        function buildHistory() {
                            if (!historyRelationMeta || historyRelationMeta.opposite) {
                                return;
                            }

                            var relationData = relationMap.relations[relationId];

                            relationData.history = relationData.history || {
                                byDates: [],
                                sorted: null
                            };

                            relationData.history.byDates.push(relation);
                        }

                        // byNodes
                        var byNodes = relationMap.byNodes[relationNodeUID] = relationMap.byNodes[relationNodeUID] || {};
                        byNodes[direction] = byNodes[direction] || {};

                        byNodes[direction][relationType.name] = byNodes[direction][relationType.name] || {
                            relationId: relationId
                        };
                    });
                },

                // Постобработка...
                // отсортировать историю
                __relationsPostProcess: function(relationMap, node) {
                    _.each(relationMap.relations, function(relationData){
                        if (!relationData.history) {
                            return;
                        }

                        relationData.history.sorted = _.sortByOrder(relationData.history.byDates,
                            ['outdated', '_since', '_actual'],
                            ['asc', 'desc', 'desc']
                        );
                    });
                },

                buildRelationHistoryList: function(historyMeta, data) {
                    if (!historyMeta || historyMeta.opposite) {
                        return null;
                    }

                    var actualNodeList      = {},
                        outdatedNodeList    = {},
                        keyOrder            = {},
                        result;

                    if (data.isJoint) {
                        _.each(data.nodeList, function(list, i){
                            keyOrder[list.key] = i;
                            buildByActual(list.key, list.data.list);
                        });
                    } else {
                        buildByActual(data.relationType, data.nodeList);
                    }

                    actualNodeList = buildList(actualNodeList);
                    outdatedNodeList = buildList(outdatedNodeList);

                    function buildByActual(relationType, nodeList) {
                        var relationId, lastRelation, targetNodeList, byKey, size;

                        nodeList = _.sortBy(nodeList, function(node){
                            relationId = _.get(data.relationMap.byNodes[node.__uid], [data.direction, relationType, 'relationId']);

                            if (!relationId) {
                                $log.debug('WARN: No realation by node in relationMap...\n\tnode.__uid:', node.__uid, '\n\tdata:', data);
                                return 0;
                            }

                            lastRelation = data.relationMap.relations[relationId].history.sorted[0];
                            return -lastRelation['_since'];
                        });

                        _.each(nodeList, function(node){
                            relationId = _.get(data.relationMap.byNodes[node.__uid], [data.direction, relationType, 'relationId']);

                            if (relationId) {
                                lastRelation = data.relationMap.relations[relationId].history.sorted[0];
                                // targetNodeList = lastRelation.__isOutdated ? outdatedNodeList : actualNodeList;
                                targetNodeList = lastRelation.outdated ? outdatedNodeList : actualNodeList;
                            } else {
                                $log.debug('WARN: No realation by node in relationMap...\n\tnode.__uid:', node.__uid, '\n\tdata:', data);
                                return;
                            }

                            byKey = targetNodeList[relationType] = targetNodeList[relationType] || {
                                key: relationType,
                                direction: data.direction,
                                data: {
                                    list: [],
                                    total: 0
                                }
                            };

                            byKey.data.list.push(node);
                            byKey.data.total = _.size(byKey.data.list);

                            // Индексы согласно формируемому списку
                            node.__index = byKey.data.total - 1;
                        });
                    }

                    function buildList(nodeList) {
                        return _.sortBy(nodeList, function(byKey, key){
                            return keyOrder[key];
                        });
                    }

                    result = {
                        actual: {
                            nodeList: actualNodeList
                        },
                        outdated: _.isEmpty(outdatedNodeList) ? null : {
                            nodeList: outdatedNodeList
                        }
                    };

                    $log.debug('buildRelationHistoryList... result', result);

                    return result;
                },

                buildRelationInfo: function(node, relationType, data) {
                    node.__info = node.__info || {};
                    node.__info[relationType] = data.count;
                },

                buildKinsmenRelation: function(srcNode, dstNode) {
                    return {
                        _type: 'kinsmen',
                        _srcId: srcNode._id,
                        _dstId: dstNode._id,
                        kinship: dstNode._kinship
                    };
                },

                isNodeEquals: function(node1, node2) {
                    if (!node1 || !node2) {
                        return null;
                    }

                    return node1.__uid === node2.__uid;
                },

                isNodesEquals: function(nodes1, nodes2) {
                    if (_.size(nodes1) !== _.size(nodes2) || !_.size(nodes1) || !_.size(nodes2)) {
                        return false;
                    }

                    var find;

                    _.each(nodes1, function(node1){
                        find = !!_.find(nodes2, function(node2){
                            return metaHelper.isNodeEquals(node1, node2);
                        });

                        return find;
                    });

                    return find;
                }
            };

            return metaHelper;
        }])
        //
        .filter('nodeNameHtml', ['$filter', function($filter){
            return function(node){
                if (node._type === 'COMPANY') {
                    return '<b>' + (node.nameshortsort || node.namesort) + '</b>';
                }
                if (node._type === 'INDIVIDUAL_IDENTITY') {
                    return '<b>' + node.name + '</b>';
                }
                if (node._type === 'INDIVIDUAL') {
                    return '<b>' + node.name + '</b>';
                }
                if (node._type === 'ADDRESS') {
                    return '<b>' + node.value + '</b>';
                }
                if (node._type === 'PHONE') {
                    return '<b>' + node.value + '</b>';
                }
                if (node._type === 'PURCHASE') {
                    return '<div><b>' + node.form + '</b>' +
                            (node.date ? ('&nbsp;&nbsp;&nbsp;&nbsp;' + $filter('amDateFormat')(node.date, _trc("mediumDate", "Формат даты: http://momentjs.com/docs/#/displaying/format/"))) : '') +
                            (node.total_price ? ('&nbsp;&nbsp;&nbsp;&nbsp;' + $filter('number')(node.total_price, 0) + '&nbsp;' + _tr(node.currency)) : '') +
                        '</div>' +
                        (node.name ? ('<div>' + node.name) + '</div>' : '');
                }
            };
        }])
        //
        // @Deprecated
        .filter('targetRelationsInfo', ['$log', '$filter', '$sce', 'npRsearchMetaHelper', 'appConfig', 'nkbScreenHelper', function($log, $filter, $sce, npRsearchMetaHelper, appConfig, nkbScreenHelper){
            // COMPANY-COMPANY
            //      FOUNDER_COMPANY
            //          <доля %>
            //          <доля руб>
            //      AFFILIATED_COMPANY
            //          <основание>
            //          <доля в УК>
            //          <доля в акциях>
            //
            // COMPANY-INDIVIDUAL
            //      FOUNDER_INDIVIDUAL
            //          <доля %>
            //          <доля руб>
            //      EXECUTIVE_INDIVIDUAL
            //          <должность>
            //      AFFILIATED_INDIVIDUAL
            //          <основание>
            //          <доля в УК>
            //          <доля в акциях>
            //      EMPLOYEE
            //          <email>
            //          <телефон>
            //      + <ИНН>
            //
            // PURCHASE-COMPANY
            //      PARTICIPANT_COMPANY
            //          <лот>
            //          <статус>
            //          <цена>
            //
            // PURCHASE-INDIVIDUAL
            //      PARTICIPANT_INDIVIDUAL
            //          <лот>
            //          <статус>
            //          <цена>
            //      COMMISSION_MEMBER
            //          <role>
            //
            return function(data, node, anyway, relationHistory, relationSeparator){
                if (!data || !node) {
                    return null;
                }

                var space       = ' ',
                    nbsp        = '\u00A0',     // &nbsp
                    separator   = ', ',         // , + space
                    dash        = ' —\u00A0';   // space + dash + &nbsp

                relationSeparator = relationSeparator || separator;

                var SHOW_TYPES = {
                    'FOUNDER_COMPANY': {
                        order: 101,
                        text: function(relation){
                            return getFounderText(relation);
                        }
                    },

                    'AFFILIATED_COMPANY': {
                        order: 102,
                        text: function(relation){
                            return getAffiliatedText(relation);
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
                            return getExecutiveText(relation);
                        }
                    },

                    'AFFILIATED_INDIVIDUAL': {
                        order: 203,
                        text: function(relation){
                            return getAffiliatedText(relation);
                        }
                    },

                    'EMPLOYEE': {
                        order: 204,
                        mergedInn: true,
                        text: function(relation){
                            return getEmployeeText(relation);
                        }
                    },

                    'PARTICIPANT_COMPANY': {
                        order: 301,
                        text: function(relation){
                            return getParticipantText(relation);
                        }
                    },

                    'PARTICIPANT_INDIVIDUAL': {
                        order: 401,
                        mergedInn: true,
                        text: function(relation){
                            return getParticipantText(relation);
                        }
                    },

                    'COMMISSION_MEMBER': {
                        order: 501,
                        text: function(relation){
                            return getCommissionMemberText(relation);
                        }
                    },

                    'kinsmen': {
                        order: 601,
                        data: {
                            availableKinship: {
                                'FATHER':            _tr("отец"),
                                //'LASTNAME':          null,
                                //'MALE_LASTNAME':     null,
                                'FEMALE_LASTNAME':   _tr("супруга"),
                                //'SIBLING':           null,
                                'BROTHER':           _tr("брат"),
                                'SISTER':            _tr("сестра"),
                                //'CHILD':             null,
                                'SON':               _tr("сын"),
                                'DAUGHTER':          _tr("дочь")
                            }
                        },
                        text: function(relation){
                            return getKinsmenText(relation);
                        }
                    }
                };

                function getRelationText(relation, properties) {
                    var t = [],
                        value, v;

                    _.each(properties, function(p){
                        value = relation[p.name] || (p.alternateData && p.alternateData[p.name]);

                        if (value) {
                            v = p.filter ? p.filter(value) : value;
                            if (v) {
                                t.push(v);
                            }
                        }
                    });

                    return t.join(separator);
                }

                function getFounderTextByRelation(relation, isTarget) {
                    var sText = getSinceAndSourceText(relation);

                    if (relation.sharePercent || relation.shareAmount) {
                        return _trc("доля", "Доля в учреждении компании") + nbsp +
                            (relation.sharePercent ?
                                (nkbScreenHelper.isScreen(relation.sharePercent) ?
                                    nkbScreenHelper.screen(relation.sharePercent) :
                                    $filter('share')(relation.sharePercent, 2)
                                ) + '%' : '') +
                            (relation.sharePercent && relation.shareAmount ? nbsp + nbsp : '') +
                            (relation.shareAmount ?
                                (nkbScreenHelper.isScreen(relation.shareAmount) ?
                                    nkbScreenHelper.screen(relation.shareAmount) :
                                    $filter('number')(relation.shareAmount)
                                ) + nbsp + _tr("руб.") : '') +
                            sText;
                    }

                    return buildDefaultText(relation, isTarget, _tr("учредитель") + sText, true);
                }

                function getFounderText(relation) {
                    var relationHistoryInfo =
                        data.relationInfo.relationMap.relations[relation.__id].history ||
                        _.get(node.__relationMap, ['relations', relation.__id, 'history']);

                    if (!relationHistoryInfo) {
                        return getFounderTextByRelation(relation, relation.__isTarget);
                    }

                    var historyTexts    = [],
                        historyText;

                    _.each(relationHistoryInfo.sorted, function(historyRelation){
                        historyText = getFounderTextByRelation(historyRelation, relation.__isTarget);

                        if (historyText) {
                            historyTexts.push(buildHistoryText(historyRelation, historyText));
                        }

                        return !!relationHistory;
                    });

                    return historyTexts.join(relationSeparator);
                }

                function getExecutiveTextByRelation(relation, isTarget) {
                    var sText = getSinceAndSourceText(relation);

                    if (relation.position) {
                        return nkbScreenHelper.isScreen(relation.position) ?
                                nkbScreenHelper.screen(relation.position) :
                                $filter('multiline')(relation.position, 'line', 50) + sText;
                    }

                    return buildDefaultText(relation, isTarget, _tr("руководитель") + sText, true);
                }

                // Дублирование кода с getFounderText
                // TODO обобщить код
                function getExecutiveText(relation) {
                    var relationHistoryInfo =
                        data.relationInfo.relationMap.relations[relation.__id].history ||
                        _.get(node.__relationMap, ['relations', relation.__id, 'history']);

                    if (!relationHistoryInfo) {
                        return getExecutiveTextByRelation(relation, relation.__isTarget);
                    }

                    var historyTexts    = [],
                        historyText;

                    _.each(relationHistoryInfo.sorted, function(historyRelation){
                        historyText = getExecutiveTextByRelation(historyRelation, relation.__isTarget);

                        if (historyText) {
                            historyTexts.push(buildHistoryText(historyRelation, historyText));
                        }

                        return !!relationHistory;
                    });

                    return historyTexts.join(relationSeparator);
                }

                function getAffiliatedText(relation) {
                    var t = getRelationText(relation, [{
                        name: 'causes',
                        filter: function(causes) {
                            var v = [];

                            _.each(causes, function(cause){
                                if (cause.name) {
                                    v.push(_tr(cause.name));
                                }
                            });

                            return v.join(separator);
                        }
                    }, {
                        name: 'shareCapital',
                        filter: function(v) {
                            return _tr("доля УК") + nbsp + $filter('share')(v) + '%';
                        }
                    }, {
                        name: 'shareStock',
                        filter: function(v) {
                            return _tr("доля акций") + nbsp + $filter('share')(v) + '%';
                        }
                    }]);

                    if (t) {
                        return t;
                    }

                    return buildDefaultText(relation, relation.__isTarget, _tr("аффилированное лицо"), false);
                }

                function getEmployeeText(relation) {
                    var t = getRelationText(relation, [{
                        name: 'phone'
                    }, {
                        name: 'email'
                    }]);

                    if (t) {
                        return t;
                    }

                    return buildDefaultText(relation, relation.__isTarget, _tr("контактное лицо"), false);
                }

                function getParticipantText(relation) {
                    var purchaseNode = (data.node._type === 'PURCHASE' ? data.node : (node._type === 'PURCHASE' ? node : null));

                    var statusOrder = {
                        'WIN': 0,
                        'PARTICIPANT': 1,
                        'NOT_ADMITTED': 2
                    };

                    var ts = [],
                        byStatusMap = {},
                        alternateData, t,
                        byStatus, status, byStatusList,
                        price, lotNumber;

                    _.each(relation.lots, function(lot){
                        alternateData = (
                            purchaseNode.__lotMap[lot.lot] &&
                            purchaseNode.__lotMap[lot.lot].applications &&
                            purchaseNode.__lotMap[lot.lot].applications[lot.application]
                        ) || {};

                        status      = lot['status'] || alternateData['status'] || 'PARTICIPANT';
                        price       = lot['price'] || alternateData['price'] || 0;
                        lotNumber   = lot['lot'];

                        byStatus = byStatusMap[status];

                        if (byStatus) {
                            byStatus.totalPrice += price;
                            byStatus.lots.push(lotNumber);
                        } else {
                            byStatusMap[status] = {
                                status: status,
                                totalPrice: price,
                                lots: [lotNumber]
                            };
                        }
                    });

                    byStatusList = _.sortBy(byStatusMap, function(s, k){
                        return statusOrder[k];
                    });

                    _.each(byStatusList, function(s){
                        t = [_tr(s.status)];

                        if (s.totalPrice) {
                            t.push($filter('number')(s.totalPrice, 0) + nbsp + _tr(purchaseNode.currency));
                        }

                        t.push(
                            (_.size(s.lots) === 1 ? _trc("лот", "лот в закупке") : _trc("лоты", "лот в закупке")) +
                            nbsp + s.lots.join(separator)
                        );

                        ts.push(t.join(nbsp));
                    });

                    return ts.join(separator);
                }

                function getCommissionMemberText(relation) {
                    if (relation.role) {
                        return relation.role;
                    }

                    return buildDefaultText(relation, relation.__isTarget, _tr("член комиссии"), false);
                }

                function getKinsmenText(relation) {
                    var ts = [], k;

                    _.each(relation.kinship, function(t){
                        k = SHOW_TYPES['kinsmen'].data.availableKinship[t];

                        if (k) {
                            ts.push(_tr(k));
                        }
                    });

                    return _.size(ts) ?
                        _trc("возможно", "возможно жена, сестра или мать") + nbsp + _.toSentence(ts, separator, nbsp + _trc("или", "возможно жена, сестра или мать") + nbsp) :
                        null;
                }

                function getSinceText(relation) {
                    if (!relation._since) {
                        return '';
                    }

                    return _trc("с", "с такой-то даты") + nbsp +
                        (nkbScreenHelper.isScreen(relation._since) ?
                            nkbScreenHelper.screen(relation._since) :
                            $filter('amDateFormat')(relation._since, _trc("mediumDate", "Формат даты: http://momentjs.com/docs/#/displaying/format/")));
                }

                // @Deprecated
                function getSourceCount(relation) {
                    return _.size(_.get(data.relationInfo.relationMap.byRelations, [
                        data.relationInfo.relationType, data.relationInfo.direction, 'bySources'
                    ]));
                }

                function getSourceText(relation) {
                    // if (!relation._actual || !relation._source || getSourceCount(relation) < 2) {
                    if (!relation._actual || !relation._source) {
                        return '';
                    }

                    return _tr(relation._source) +
                        nbsp + _trc("от", "от такой-то даты") + nbsp +
                        (nkbScreenHelper.isScreen(relation._actual) ?
                            nkbScreenHelper.screen(relation._actual) :
                            $filter('amDateFormat')(relation._actual, _trc("mediumDate", "Формат даты: http://momentjs.com/docs/#/displaying/format/")));
                }

                function getSinceAndSourceText(relation) {
                    var sinceText   = relationHistory ? getSinceText(relation) : null,
                        sourceText  = relationHistory ? getSourceText(relation) : null;

                    return sinceText && sourceText ?
                        (dash + sinceText + space + sourceText) :
                        (sinceText || sourceText ? dash + (sinceText || sourceText) : '');
                }

                function getInnText(inn) {
                    return _tr("ИНН") + nbsp + (nkbScreenHelper.isScreen(inn) ? nkbScreenHelper.screen(inn) : inn);
                }

                function buildHistoryText(relation, historyText) {
                    if (relation.outdated) {
                        return '<i class="icon i-history"></i>' + historyText;
                    }

                    return historyText;
                }

                function buildDefaultText(relation, isTarget, defaultText, checkHistory) {
                    if (checkHistory) {
                        return (isTarget && relationHistory) || !isTarget || anyway ? defaultText : '';
                    }

                    return !isTarget || anyway ? defaultText : '';
                }

                //
                var list = [];

                _.each(_.get(data.relationInfo.relationMap.byNodes, [node.__uid, data.relationInfo.direction]), function(byRelationType, relationType){
                    if (SHOW_TYPES[relationType]) {
                        var relation = data.relationInfo.relationMap.relations[byRelationType.relationId].relation;

                        relation.__isTarget =
                            (relation._type === data.relationInfo.relationType) ||
                            npRsearchMetaHelper.isRelationTypeInMergedType(relation._type, data.relationInfo.relationType, data.relationInfo.direction);

                        list.push(relation);
                    }
                });

                var size = _.size(list);

                if (size === 0) {
                    return null;
                }

                var texts = [],
                    inn;

                list = _.sortBy(list, function(relation){
                    return relation.__isTarget ? 0 : SHOW_TYPES[relation._type].order;
                });

                _.each(list, function(relation, i){
                    var showType    = SHOW_TYPES[relation._type],
                        t           = showType.text(relation);

                    if (t) {
                        texts.push(t);
                    }

                    if (!inn && showType.mergedInn) {
                        inn = relation.inn;
                    }
                });

                if (inn) {
                    texts.push(getInnText(inn));
                }

                return $sce.trustAsHtml(texts.join(relationSeparator));
            };
        }])
        //
        .factory('npRsearchRelationHelper', ['$log', '$filter', 'nkbScreenHelper', function($log, $filter, nkbScreenHelper){

            var nbsp                        = '\u00A0',     // &nbsp
                // space                       = ' ',
                // dash                        = ' —\u00A0',   // space + dash + &nbsp
                separator                   = ', ',         // , + space
                wrapRelationTextsSeparator  = ',\n';

            var SHOW_TYPES = {
                'FOUNDER_COMPANY': {
                    order: 101,
                    text: function(relation, srcNode, dstNode) {
                        return getFounderText(relation);
                    }
                },

                'AFFILIATED_COMPANY': {
                    order: 102,
                    text: function(relation, srcNode, dstNode, options) {
                        return getAffiliatedText(relation, srcNode, dstNode, options);
                    }
                },

                'FOUNDER_INDIVIDUAL': {
                    order: 201,
                    mergedInn: true,
                    text: function(relation, srcNode, dstNode) {
                        return getFounderText(relation);
                    }
                },

                'EXECUTIVE_INDIVIDUAL': {
                    order: 202,
                    mergedInn: true,
                    text: function(relation, srcNode, dstNode, options) {
                        return getExecutiveText(relation, srcNode, dstNode, options);
                    }
                },

                'AFFILIATED_INDIVIDUAL': {
                    order: 203,
                    text: function(relation, srcNode, dstNode, options) {
                        return getAffiliatedText(relation, srcNode, dstNode, options);
                    }
                },

                'EMPLOYEE': {
                    order: 204,
                    mergedInn: true,
                    text: function(relation, srcNode, dstNode) {
                        return getEmployeeText(relation);
                    }
                },

                'PARTICIPANT_COMPANY': {
                    order: 301,
                    text: function(relation, srcNode, dstNode) {
                        return getParticipantText(relation, srcNode, dstNode);
                    }
                },

                'PARTICIPANT_INDIVIDUAL': {
                    order: 401,
                    mergedInn: true,
                    text: function(relation, srcNode, dstNode) {
                        return getParticipantText(relation, srcNode, dstNode);
                    }
                },

                'COMMISSION_MEMBER': {
                    order: 501,
                    text: function(relation, srcNode, dstNode) {
                        return getCommissionMemberText(relation);
                    }
                },

                'HEAD_COMPANY': {
                    order: 10010,
                    text: function(relation, srcNode, dstNode) {
                        return _tr("головная компания");
                    }
                },

                'PREDECESSOR_COMPANY': {
                    order: 10020,
                    text: function(relation, srcNode, dstNode) {
                        return _tr("предшественник");
                    }
                },

                'REGISTER_HOLDER': {
                    order: 10030,
                    text: function(relation, srcNode, dstNode) {
                        return _tr("реестродержатель");
                    }
                },

                'EXECUTIVE_COMPANY': {
                    order: 10040,
                    text: function(relation, srcNode, dstNode) {
                        return _tr("Управляющая компания");
                    }
                },

                'ADDRESS': {
                    order: 10050,
                    text: function(relation, srcNode, dstNode) {
                        return null;
                    }
                },

                'PHONE': {
                    order: 10060,
                    text: function(relation, srcNode, dstNode) {
                        return null;
                    }
                },

                'CUSTOMER_COMPANY': {
                    order: 10070,
                    text: function(relation, srcNode, dstNode) {
                        return _tr("Заказчик");
                    }
                },

                'kinsmen': {
                    order: 20000,
                    data: {
                        availableKinship: {
                            'FATHER':            _tr("отец"),
                            //'LASTNAME':          null,
                            //'MALE_LASTNAME':     null,
                            'FEMALE_LASTNAME':   _tr("супруга"),
                            //'SIBLING':           null,
                            'BROTHER':           _tr("брат"),
                            'SISTER':            _tr("сестра"),
                            //'CHILD':             null,
                            'SON':               _tr("сын"),
                            'DAUGHTER':          _tr("дочь")
                        }
                    },
                    text: function(relation){
                        return getKinsmenText(relation);
                    }
                }
            };

            function getRelationText(relation, properties, options) {
                options = options || {};

                var t = [],
                    value, v;

                _.each(properties, function(p){
                    value = relation[p.name] || (p.alternateData && p.alternateData[p.name]);

                    if (value) {
                        v = p.filter ? p.filter(value) : value;
                        if (v) {
                            t.push(v);
                        }
                    }
                });

                return t.join(options.wrapRelationTexts ? wrapRelationTextsSeparator : separator);
            }

            function getFounderText(relation) {
                if (relation.sharePercent || relation.shareAmount) {
                    return _trc("доля", "Доля в учреждении компании") + nbsp +
                        (relation.sharePercent ?
                            (nkbScreenHelper.isScreen(relation.sharePercent) ?
                                nkbScreenHelper.screen(relation.sharePercent) :
                                $filter('share')(relation.sharePercent, 2)
                            ) + '%' : '') +
                        (relation.sharePercent && relation.shareAmount ? nbsp + nbsp : '') +
                        (relation.shareAmount ?
                            (nkbScreenHelper.isScreen(relation.shareAmount) ?
                                nkbScreenHelper.screen(relation.shareAmount) :
                                $filter('number')(relation.shareAmount)
                            ) + nbsp + _tr("руб.") : '');
                }

                return _tr("учредитель");
            }

            function getExecutiveText(relation, srcNode, dstNode, options) {
                if (relation.position) {
                    return nkbScreenHelper.isScreen(relation.position) ?
                            nkbScreenHelper.screen(relation.position) :
                            $filter('multiline')(relation.position, 'line', options.wrapRelationTexts ? 20 : 50);
                }

                return _tr("руководитель");
            }

            function getAffiliatedText(relation, srcNode, dstNode, options) {
                var t = getRelationText(relation, [{
                    name: 'causes',
                    filter: function(causes) {
                        var v = [];

                        _.each(causes, function(cause){
                            if (cause.name) {
                                v.push(_tr(cause.name));
                            }
                        });

                        return v.join(options.wrapRelationTexts ? wrapRelationTextsSeparator : separator);
                    }
                }, {
                    name: 'shareCapital',
                    filter: function(v) {
                        return _tr("доля УК") + nbsp + $filter('share')(v) + '%';
                    }
                }, {
                    name: 'shareStock',
                    filter: function(v) {
                        return _tr("доля акций") + nbsp + $filter('share')(v) + '%';
                    }
                }], options);

                if (t) {
                    return t;
                }

                return _tr("аффилированное лицо");
            }

            function getEmployeeText(relation) {
                var t = getRelationText(relation, [{
                    name: 'phone'
                }, {
                    name: 'email'
                }]);

                if (t) {
                    return t;
                }

                return _tr("контактное лицо");
            }

            function getParticipantText(relation, srcNode, dstNode) {
                var purchaseNode = (srcNode._type === 'PURCHASE' ? srcNode : (dstNode._type === 'PURCHASE' ? dstNode : null));

                var statusOrder = {
                    'WIN': 0,
                    'PARTICIPANT': 1,
                    'NOT_ADMITTED': 2
                };

                var ts = [],
                    byStatusMap = {},
                    alternateData, t,
                    byStatus, status, byStatusList,
                    price, lotNumber;

                _.each(relation.lots, function(lot){
                    alternateData = (
                        purchaseNode.__lotMap[lot.lot] &&
                        purchaseNode.__lotMap[lot.lot].applications &&
                        purchaseNode.__lotMap[lot.lot].applications[lot.application]
                    ) || {};

                    status      = lot['status'] || alternateData['status'] || 'PARTICIPANT';
                    price       = lot['price'] || alternateData['price'] || 0;
                    lotNumber   = lot['lot'];

                    byStatus = byStatusMap[status];

                    if (byStatus) {
                        byStatus.totalPrice += price;
                        byStatus.lots.push(lotNumber);
                    } else {
                        byStatusMap[status] = {
                            status: status,
                            totalPrice: price,
                            lots: [lotNumber]
                        };
                    }
                });

                byStatusList = _.sortBy(byStatusMap, function(s, k){
                    return statusOrder[k];
                });

                _.each(byStatusList, function(s){
                    t = [_tr(s.status)];

                    if (s.totalPrice) {
                        t.push($filter('number')(s.totalPrice, 0) + nbsp + _tr(purchaseNode.currency));
                    }

                    // t.push(
                    //     (_.size(s.lots) === 1 ? _trc("лот", "лот в закупке") : _trc("лоты", "лот в закупке")) +
                    //     nbsp + s.lots.join(separator)
                    // );

                    ts.push(t.join(nbsp));
                });

                return ts.join(separator);
            }

            function getCommissionMemberText(relation) {
                if (relation.role) {
                    return relation.role;
                }

                return _tr("член комиссии");
            }

            function getKinsmenText(relation) {
                var ts = [], k;

                _.each(relation.kinship, function(t){
                    k = SHOW_TYPES['kinsmen'].data.availableKinship[t];

                    if (k) {
                        ts.push(_tr(k));
                    }
                });

                return _.size(ts) ?
                    _trc("возможно", "возможно жена, сестра или мать") + nbsp + _.toSentence(ts, separator, nbsp + _trc("или", "возможно жена, сестра или мать") + nbsp) :
                    null;
            }

            function getSinceText(relation) {
                if (!relation._since) {
                    return '';
                }

                return _trc("с", "с такой-то даты") + nbsp +
                    (nkbScreenHelper.isScreen(relation._since) ?
                        nkbScreenHelper.screen(relation._since) :
                        $filter('amDateFormat')(relation._since, _trc("mediumDate", "Формат даты: http://momentjs.com/docs/#/displaying/format/")));
            }

            function getActualText(relation) {
                if (!relation._actual || !relation._source) {
                    return '';
                }

                return _tr(relation._source) +
                    nbsp + _trc("от", "от такой-то даты") + nbsp +
                    (nkbScreenHelper.isScreen(relation._actual) ?
                        nkbScreenHelper.screen(relation._actual) :
                        $filter('amDateFormat')(relation._actual, _trc("mediumDate", "Формат даты: http://momentjs.com/docs/#/displaying/format/")));
            }

            function getInnText(inn) {
                return _tr("ИНН") + nbsp + (nkbScreenHelper.isScreen(inn) ? nkbScreenHelper.screen(inn) : inn);
            }

            //
            var relationHelper = {
                buildRelationsInfoBetweenNodes: function(srcNode, dstNode, options) {
                    options = options || {};

                    var byRelationTypes = _.get(srcNode.__relationMap.byNodes, [dstNode.__uid, 'children']) || _.get(srcNode.__relationMap.byNodes, [dstNode.__uid, 'parents']);

                    var list = [],
                        direction, inn;

                    _.each(byRelationTypes, function(byRelationType, relationType){
                        var showType        = SHOW_TYPES[relationType],
                            relationId      = byRelationType.relationId,
                            srcRelationData = srcNode.__relationMap.relations[relationId];

                        direction = srcRelationData.direction;

                        if (!showType) {
                            return;
                        }

                        var dstRelationData     = dstNode.__relationMap.relations[relationId],
                            relationHistoryInfo = _.get(srcRelationData, 'history') || _.get(dstRelationData, 'history'),
                            relations           = relationHistoryInfo ? relationHistoryInfo.sorted : [srcRelationData.relation],
                            texts               = [];

                        _.each(relations, function(relation){
                            texts.push({
                                text: _.capitalize(showType.text(relation, srcNode, dstNode, options)),
                                sinceText: getSinceText(relation),
                                actualText: getActualText(relation),
                                outdated: relation.outdated
                            });

                            return false; // TODO учитывать все связи при определенной опции
                        });

                        if (!inn && showType.mergedInn) {
                            // inn = relations[0].inn;

                            // TODO разобраться и объединтить код с:
                            // __relationsProcess
                            // смержить специфические свойства
                            inn = _.result(_.find(relations, function(r){
                                return !!r.inn;
                            }), 'inn');
                        }

                        var relationData = {
                            relationId: relationId,
                            relationType: relationType,
                            texts: texts,
                            isTarget: false // TODO
                        };

                        list.push(relationData);
                    });

                    list = _.sortBy(list, function(relationData){
                        return relationData.isTarget ? 0 : SHOW_TYPES[relationData.relationType].order;
                    });

                    return {
                        direction: direction,
                        innText: inn ? getInnText(inn) : null,
                        list: list
                    };
                }
            };

            //
            return relationHelper;
        }]);
    //
});
