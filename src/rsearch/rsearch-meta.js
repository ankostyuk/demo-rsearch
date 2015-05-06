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
            relationTypes: {}
        })
        //
        .factory('npRsearchMetaHelper', ['$log', '$q', '$rootScope', 'appConfig', 'npRsearchMeta', 'npRsearchResource', function($log, $q, $rootScope, appConfig, npRsearchMeta, npRsearchResource){
            var resourceConfig = appConfig.resource || {};

            // init meta
            var initDefer = $q.defer();

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

                    //
                    node.__idField = nodeTypesMeta[node._type]['idField'];

                    // компания
                    if (node._type === 'COMPANY') {
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

                buildRelationMap: function(node) {
                    var relationMap = {},
                        byNodes     = {},
                        byRelations = {};

                    _.each(node._relations, function(relation){
                        var relationType    = relationTypesMeta[relation._type],
                            srcNodeUID      = metaHelper.buildNodeUIDByType(relation._srcId, relationType.sourceNodeType),
                            dstNodeUID      = metaHelper.buildNodeUIDByType(relation._dstId, relationType.destinationNodeType);

                        _.each([[srcNodeUID, 'parents'], [dstNodeUID, 'children']], function(conf){
                            var nodeUID     = conf[0],
                                direction   = conf[1];

                            // Только связи с другими нодами и "кольцевые" связи
                            if (nodeUID === node.__uid && srcNodeUID !== dstNodeUID) {
                                return;
                            }

                            // byNodes
                            var relationInfoByNodes = byNodes[nodeUID] || {
                                'parents': {},
                                'children': {}
                            };

                            relationInfoByNodes[direction][relation._type] = relation;

                            byNodes[nodeUID] = relationInfoByNodes;

                            // byRelations
                            var relationInfoByRelations = byRelations[relation._type] || {
                                'parents': {},
                                'children': {}
                            };

                            // byRelations bySources
                            // TODO только для определенных типов связей: для оптимизации по скорости и памяти
                            var bySources   = relationInfoByRelations[direction]['bySources'] || {},
                                source      = relation._source;

                            if (source) {
                                var sourceData = bySources[source] || {};
                                // Пока пустой объект: только фиксируем количество источников.
                                bySources[source] = sourceData;
                            }

                            relationInfoByRelations[direction]['bySources'] = bySources;

                            // byRelations byActual
                            // <<< @Deprecated relation_history
                            // Временное решение для отладки истории связей
                            // TODO Сделать API и нормальный фильтр
                            var byActual    = relationInfoByRelations[direction]['byActual'] || {},
                                actual      = relation._actual;

                            if (actual) {
                                var actualData = byActual[actual] || {
                                    actual: actual,
                                    relations: []
                                };

                                actualData.relations.push(relation);

                                byActual[actual] = actualData;
                            }

                            relationInfoByRelations[direction]['byActual'] = byActual;
                            // >>>

                            byRelations[relation._type] = relationInfoByRelations;
                        });
                    });

                    relationMap.byNodes = byNodes;
                    relationMap.byRelations = byRelations;

                    return relationMap;
                },

                addToRelationMap: function(relationMap, srcNode, dstNode, direction, relation) {
                    relationMap.byNodes = relationMap.byNodes || {};

                    var byNodes = relationMap.byNodes;

                    byNodes[dstNode.__uid] = byNodes[dstNode.__uid] || {};
                    byNodes[dstNode.__uid][direction] = byNodes[dstNode.__uid][direction] || {};
                    byNodes[dstNode.__uid][direction][relation._type] = relation;
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
        .filter('targetRelationsInfo', ['$log', '$filter', 'appConfig', function($log, $filter, appConfig){
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
            return function(data, node, anyway){
                if (!data || !node) {
                    return null;
                }

                var nbsp        = ' ',      // &nbsp
                    separator   = ', ',     // , + space
                    dash        = ' — ';    // space + dash + &nbsp

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

                function isTargetRelation(relation) {
                    return relation._type === data.relationInfo.relationType;
                }

                function getRelationText(relation, properties, sep) {
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

                    return t.join(sep || separator);
                }

                function getFounderText(relation) {
                    var sourceText = buildSourceText(relation);

                    if (relation.sharePercent || relation.shareAmount) {
                        return _trc("доля", "Доля в учреждении компании") + nbsp +
                            (relation.sharePercent ? $filter('share')(relation.sharePercent, 2) + '%' : '') +
                            (relation.sharePercent && relation.shareAmount ? nbsp + nbsp : '') +
                            (relation.shareAmount ? $filter('number')(relation.shareAmount) + nbsp + _tr("руб.") : '') +
                            sourceText;
                    }

                    return !isTargetRelation(relation) || anyway ? _tr("учредитель") + sourceText : '';
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

                    return !isTargetRelation(relation) || anyway ? _tr("аффилированное лицо") : '';
                }

                function getExecutiveText(relation) {
                    if (relation.position) {
                        return relation.position;
                    }

                    return !isTargetRelation(relation) || anyway ? _tr("руководитель") : '';
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

                    return !isTargetRelation(relation) || anyway ? _tr("контактное лицо") : '';
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

                    return !isTargetRelation(relation) || anyway ? _tr("член комиссии") : '';
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

                function getSourceCount(relation) {
                    return _.size(
                        data.relationInfo.relationMap.byRelations &&
                        data.relationInfo.relationMap.byRelations[data.relationInfo.relationType] &&
                        data.relationInfo.relationMap.byRelations[data.relationInfo.relationType][data.relationInfo.direction]['bySources']
                    );
                }

                function getSourceText(relation) {
                    if (!relation._actual || !relation._source) {
                        return '';
                    }

                    return dash + _tr(relation._source) +
                        nbsp + _trc("от", "от такой-то даты") + nbsp +
                        $filter('amDateFormat')(relation._actual, _trc("mediumDate", "Формат даты: http://momentjs.com/docs/#/displaying/format/"));
                }

                function buildSourceText(relation) {
                    return getSourceCount(relation) > 1 ? getSourceText(relation) : '';
                }

                function getInnText(inn) {
                    return _tr("ИНН") + nbsp + inn;
                }

                var relations   = data.relationInfo.relationMap.byNodes && data.relationInfo.relationMap.byNodes[node.__uid] && data.relationInfo.relationMap.byNodes[node.__uid][data.relationInfo.direction],
                    list        = [];

                _.each(relations, function(relation, type){
                    if (SHOW_TYPES[type]) {
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
                    return relation._type === data.relationInfo.relationType ? 0 : SHOW_TYPES[relation._type].order;
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

                return _.capitalize(texts.join(separator));
            };
        }]);
    //
});
