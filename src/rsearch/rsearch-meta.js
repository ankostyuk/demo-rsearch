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

    // <<< @Deprecated
    // Временное решение для отладки истории связей
    var purl                = require('purl'),
        locationSearch      = purl().param(),
        __collapseHistory   = locationSearch['collapse-history'] === 'false' ? false : true;
        console.warn('__collapseHistory:', __collapseHistory);
    // >>>

    return angular.module('np.rsearch-meta', _.pluck(extmodules, 'name'))
        //
        .constant('npRsearchMeta', {
            // Дополнительные свойства для нод
            nodeTypes: {
                'COMPANY': {
                    search: true,
                    searchResultPriority: 4
                },
                'INDIVIDUAL': {
                    search: true,
                    searchResultPriority: 3
                },
                'ADDRESS': {
                    search: true,
                    searchResultPriority: 2
                },
                'PHONE': {
                    search: true,
                    searchResultPriority: 1
                },
                'PURCHASE': {
                    search: false,
                    searchResultPriority: 0
                }
            },

            // Дополнительные свойства для связей
            //
            // TODO автоматическое формирование свойств для объединенных типов на основе базовых типов
            //
            // TODO учитывать _actual в historyProperties для FOUNDER_INDIVIDUAL, FOUNDER_COMPANY
            //
            // TODO учитывать _since в historyProperties,
            // но сначала проверить формирование данных на сервере -- правильно ли ставится _since,
            // т.к. при тестировании с учетом _since были замечены одинаковые данные
            // по historyProperties с "близким" _since
            //
            // TODO проверить sharePercent
            // ООО "ОНИКС" ОКПО 59412169 учредитель ООО КБ "НКБ" ОКПО 33774455
            // в исторических связях есть "близкие" sharePercent
            // sharePercent: 26.666666666666668
            // sharePercent: 26.6667
            // sharePercent: 26.67
            // -- не схлопнулись исторические связи
            relationTypes: {
                'FOUNDER': {
                    history: {
                        historyProperties: ['_since'],
                        collapseProperties: ['shareAmount', 'sharePercent']
                    }
                },
                'FOUNDER_INDIVIDUAL': {
                    history: {
                        historyProperties: ['_since'],
                        collapseProperties: ['shareAmount', 'sharePercent']
                    }
                },
                'FOUNDER_COMPANY': {
                    history: {
                        historyProperties: ['_since'],
                        collapseProperties: ['shareAmount', 'sharePercent']
                    }
                },

                'EXECUTIVE_INDIVIDUAL': {
                    history: {
                        historyProperties: ['_since'],
                        collapseProperties: ['position']
                    }
                }
            },

            mergedRelationTypes: {
                'FOUNDER': ['FOUNDER_INDIVIDUAL', 'FOUNDER_COMPANY']
            },

            historyRelationDate: '_actual'
        })
        //
        .factory('npRsearchMetaHelper', ['$log', '$q', '$rootScope', 'appConfig', 'npRsearchMeta', 'npRsearchResource', function($log, $q, $rootScope, appConfig, npRsearchMeta, npRsearchResource){
            var resourceConfig = appConfig.resource || {};

            // init meta
            var initDefer = $q.defer();

            var nodeTypesMeta       = {},
                relationTypesMeta   = {},
                nodeTypes, relationTypes;

            if (!resourceConfig.noInitMeta) {
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

                initDefer.resolve();
                $rootScope.$emit('np-rsearch-meta-ready');
            }

            // API
            var metaHelper = {

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

                buildNodeExtraMeta: function(node) {
                    if (!node) {
                        return;
                    }

                    // uid
                    metaHelper.buildNodeUID(node);

                    //
                    node.__idField = nodeTypesMeta[node._type]['idField'];

                    // компания
                    if (node._type === 'COMPANY') {
                        metaHelper.buildCompanyState(node);

                        // группы связей
                        node.__isAffiliatedRelations = isRelations([
                            ['AFFILIATED_COMPANY', 'in'],
                            ['AFFILIATED_INDIVIDUAL', 'in'],
                            ['AFFILIATED_COMPANY', 'out']
                        ]);

                        node.__isContactsRelations = isRelations([
                            ['ADDRESS', 'in'],
                            ['PHONE', 'in']
                        ]);

                        node.__isPurchaseRelations = isRelations([
                            ['CUSTOMER_COMPANY', 'out'],
                            ['PARTICIPANT_COMPANY', 'out'],
                            ['EMPLOYEE', 'in']
                        ]);
                    } else
                    // физическое лицо
                    if (node._type === 'INDIVIDUAL') {
                        // группы связей
                        node.__isAffiliatedRelations = isRelations([
                            ['AFFILIATED_INDIVIDUAL', 'out']
                        ]);

                        node.__isPurchaseRelations = isRelations([
                            ['PARTICIPANT_INDIVIDUAL', 'out'],
                            ['COMMISSION_MEMBER', 'out'],
                            ['EMPLOYEE', 'out']
                        ]);
                    } else
                    // закупка
                    if (node._type === 'PURCHASE') {
                        node.currency = node.currency || appConfig.meta.defaultCurrency;
                        node.__lotMap = _.indexBy(node.lots, 'lot');
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

                    function isRelations(relationTypes) {
                        if (!node._info) {
                            return false;
                        }

                        var type, d, t, i;

                        for (i = 0; i < relationTypes.length; i++) {
                            t = relationTypes[i];
                            d = t[1];
                            type = t[0];

                            if (node._info[d] && node._info[d][type]) {
                                return true;
                            }
                        }

                        return false;
                    }
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

                getRelationTypesByMergedType: function(mergedType) {
                    return npRsearchMeta.mergedRelationTypes[mergedType];
                },

                isRelationTypeInMergedType: function(relationType, mergedType) {
                    return _.contains(npRsearchMeta.mergedRelationTypes[mergedType], relationType);
                },

                getHistoryRelationMeta: function(relationType) {
                    return _.get(npRsearchMeta.relationTypes, [relationType, 'history']);
                },

                buildRelationMap: function(node) {
                    // $log.warn('* buildRelationMap node', node);

                    var relationMap = {};

                    relationMap.relations = {};
                    relationMap.byNodes = {};

                    metaHelper.__relationsProcess(relationMap, node, node._relations);
                    metaHelper.__relationsPostProcess(relationMap, node);

                    // $log.warn('>>> buildRelationMap node', relationMap);

                    return relationMap;
                },

                __relationsProcess: function(relationMap, node, relations) {
                    _.each(relations, function(relation){
                        var relationType    = relationTypesMeta[relation._type],
                            srcNodeUID      = metaHelper.buildNodeUIDByType(relation._srcId, relationType.sourceNodeType),
                            dstNodeUID      = metaHelper.buildNodeUIDByType(relation._dstId, relationType.destinationNodeType);

                        // TODO убрать parents/children -- можно обойтись без direction
                        // и убрать лишние циклы -- оптимизация
                        _.each([[srcNodeUID, 'parents'], [dstNodeUID, 'children']], function(conf){
                            var nodeUID     = conf[0],
                                direction   = conf[1];

                            // Только связи с другими нодами и "кольцевые" связи
                            if (nodeUID === node.__uid && srcNodeUID !== dstNodeUID) {
                                return;
                            }

                            // relationMap.relations
                            var relationId      = metaHelper.buildRelationId(relation),
                                relationExist   = !!relationMap.relations[relationId];

                            relationMap.relations[relationId] = relationMap.relations[relationId] || {
                                relation: relation,
                                direction: direction
                            };

                            buildHistory();

                            function buildHistory() {
                                var historyRelationMeta = metaHelper.getHistoryRelationMeta(relationType.name);

                                if (!historyRelationMeta) {
                                    return;
                                }

                                var relationData = relationMap.relations[relationId];

                                relationData.history = relationData.history || {
                                    byDates: {},
                                    sorted: null
                                };

                                var date        = relation[npRsearchMeta.historyRelationDate],
                                    byDate      = relationData.history.byDates[date];

                                if (byDate) {
                                    // TODO убрать дубликаты на сервере
                                    $log.warn('Дубликат исторической связи по дате:', npRsearchMeta.historyRelationDate, 'nodeUID:', nodeUID, 'relation:', relation);
                                } else {
                                    relationData.history.byDates[date] = relation;
                                }
                            }

                            // byNodes
                            var byNodes = relationMap.byNodes[nodeUID] = relationMap.byNodes[nodeUID] || {
                                'parents': {},
                                'children': {}
                            };

                            byNodes[direction][relationType.name] = byNodes[direction][relationType.name] || {
                                relationId: relationId
                            };

                            // byRelations
                            var byRelationTypes = relationMap.byRelationTypes = relationMap.byRelationTypes || {
                                'parents': {},
                                'children': {}
                            };

                            byRelationTypes[direction][relationType.name] = byRelationTypes[direction][relationType.name] || {
                                // TODO на сервере
                                'info': {
                                    'relFacet': {
                                        'inn': {}
                                    }
                                }
                            };

                            // TODO на сервере
                            if (!relationExist && relation.inn) {
                                byRelationTypes[direction][relationType.name]['info']['relFacet']['inn'][relation.inn] =
                                    (byRelationTypes[direction][relationType.name]['info']['relFacet']['inn'][relation.inn] || 0) + 1;
                            }
                        });
                    });
                },

                // Постобработка...
                // отсортировать историю с проверкой дубликатов
                __relationsPostProcess: function(relationMap, node) {
                    _.each(relationMap.relations, function(relationData){
                        if (!relationData.history) {
                            return;
                        }

                        var historyRelationMeta = metaHelper.getHistoryRelationMeta(relationData.relation._type),
                            relationCount       = _.size(relationData.history.byDates),
                            existing;

                        var sorted = _.sortBy(relationData.history.byDates, function(relation){
                            return -relation[npRsearchMeta.historyRelationDate];
                        });

                        relationData.history.sorted = [];

                        _.each(sorted, function(relation, i){
                            existing = _.find(relationData.history.sorted, _.pick(relation, historyRelationMeta.historyProperties));

                            if (existing) {
                                // TODO убрать дубликаты на сервере
                                $log.warn('Дубликат исторической связи по историческим свойствам:', historyRelationMeta.historyProperties, 'nodeUID:', node.__uid, 'relation:', relation);
                                $log.info('relationData.history.sorted', relationData.history.sorted);
                            } else if (__collapseHistory &&
                                    _.last(relationData.history.sorted) &&
                                    _.isEqual(
                                        _.pick(relation, historyRelationMeta.collapseProperties),
                                        _.pick(_.last(relationData.history.sorted), historyRelationMeta.collapseProperties)
                                    )
                                ) {
                                // TODO на сервере?
                                $log.warn('Схлопнута историческая связь по свойствам:', historyRelationMeta.collapseProperties, 'nodeUID:', node.__uid, 'relation:', relation);
                            } else {
                                relationData.history.sorted.push(relation);
                            }
                        });
                    });
                },

                addToRelationMap: function(relationMap, node, relations) {
                    // $log.warn('<<< addToRelationMap...', relationMap);

                    relationMap.relations = relationMap.relations || {};
                    relationMap.byNodes = relationMap.byNodes || {};

                    metaHelper.__relationsProcess(relationMap, node, relations);
                    metaHelper.__relationsPostProcess(relationMap, node);

                    // $log.warn('>>> addToRelationMap...', relationMap);
                },

                buildRelationHistory: function(historyMeta, data) {
                    if (!historyMeta) {
                        return null;
                    }

                    var actualData      = {},
                        outdatedData    = {},
                        byDates         = {},
                        listKeys        = [];

                    if (data.isJoint) {
                        _.each(data.nodeList, function(list){
                            listKeys.push(list.key);
                            buildByDates(list.key, list.data.list);
                        });
                    } else {
                        listKeys.push(data.relationType);
                        buildByDates(data.relationType, data.nodeList);
                    }

                    function buildByDates(relationType, srcNodeList) {
                        var relationId, lastRelation, date, byDate, byRelationType;

                        _.each(srcNodeList, function(node){
                            relationId = data.relationMap.byNodes[node.__uid][data.direction][relationType].relationId;
                            lastRelation = data.relationMap.relations[relationId].history.sorted[0];

                            date = lastRelation[npRsearchMeta.historyRelationDate];

                            byDate = byDates[date] = byDates[date] || {
                                date: date,
                                byRelationTypes: {}
                            };

                            byRelationType = byDate.byRelationTypes[relationType] = byDate.byRelationTypes[relationType] || [];
                            byRelationType.push(node);
                        });
                    }

                    // Отсортировать в порядке убывания дат
                    var sortedDates = _.sortBy(byDates, function(byDate){
                        return -byDate.date;
                    });

                    // Схлопнуть все неактуальные
                    var byOutdated = {
                        byRelationTypes: {}
                    };

                    _.each(sortedDates, function(byDate, i){
                        if (i > 0) {
                            _.each(byDate.byRelationTypes, function(byRelationType, relationType){
                                byOutdated.byRelationTypes[relationType] = (byOutdated.byRelationTypes[relationType] || []).concat(byRelationType);
                            });
                        }
                    });

                    buildNodeLists(sortedDates[0], actualData);
                    buildNodeLists(byOutdated, outdatedData);

                    function buildNodeLists(byDate, target) {
                        if (_.isEmpty(byDate.byRelationTypes)) {
                            return;
                        }

                        target.nodeList = [];

                        _.each(listKeys, function(listKey){
                            var list = byDate.byRelationTypes[listKey];

                            // Индексы согласно формируемому списку
                            _.each(list, function(node, i){
                                node.__index = i;
                            });

                            target.nodeList.push({
                                data: {
                                    list: list,
                                    total: _.size(list)
                                },
                                key: listKey
                            });
                        });
                    }

                    // $log.info('buildRelationHistory... actualData', actualData);
                    // $log.info('buildRelationHistory... outdatedData', outdatedData);

                    return {
                        'actual': actualData,
                        'outdated': _.isEmpty(outdatedData) ? null : outdatedData
                    };
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
        .filter('targetRelationsInfo', ['$log', '$filter', 'npRsearchMeta', 'npRsearchMetaHelper', 'appConfig', 'nkbScreenHelper', function($log, $filter, npRsearchMeta, npRsearchMetaHelper, appConfig, nkbScreenHelper){
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
                    nbsp        = ' ',      // &nbsp
                    separator   = ', ',     // , + space
                    dash        = ' — ';    // space + dash + &nbsp

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
                    var history         = data.relationInfo.relationMap.relations[relation.__id].history.sorted,
                        historyTexts    = [],
                        historyText;

                    _.each(history, function(historyRelation){
                        historyText = getFounderTextByRelation(historyRelation, relation.__isTarget);

                        if (historyText) {
                            historyTexts.push(historyText);
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
                                relation.position + sText;
                    }

                    return buildDefaultText(relation, isTarget, _tr("руководитель") + sText, true);
                }

                function getExecutiveText(relation) {
                    var history         = data.relationInfo.relationMap.relations[relation.__id].history.sorted,
                        historyTexts    = [],
                        historyText;

                    _.each(history, function(historyRelation){
                        historyText = getExecutiveTextByRelation(historyRelation, relation.__isTarget);

                        if (historyText) {
                            historyTexts.push(historyText);
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
                            npRsearchMetaHelper.isRelationTypeInMergedType(relation._type, data.relationInfo.relationType);

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

                return _.capitalize(texts.join(relationSeparator));
            };
        }]);
    //
});
