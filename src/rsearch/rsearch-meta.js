/**
 * @module rsearch-meta
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
// TODO объеденить код со "связями"
define(function(require) {'use strict';

                  require('underscore');
    var angular = require('angular'),
        i18n    = require('i18n');

    return angular.module('np.rsearch-meta', [])
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
                            ['COMMISSION_MEMBER', 'out']
                        ]);
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
        .filter('isLastSalesVolume', ['appConfig', function(appConfig){
            return function(node){
                if (!node) {
                    return null;
                }

                return _.has(node, appConfig.meta.lastSalesVolumeField);
            };
        }])
        //
        .filter('lastSalesVolume', ['appConfig', function(appConfig){
            return function(node){
                if (!node) {
                    return null;
                }

                return node[appConfig.meta.lastSalesVolumeField] / appConfig.meta.currencyOrder;
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

                var okved       = node['okvedcode_bal'] || node['okvedcode_main'],
                    okvedText   = node['okved_bal_text'] || node['okved_main_text'];

                if (!okved || !okvedText) {
                    return null;
                }

                var okvedCode = _.chop(okved, 2).join('.');

                return okvedCode + ' ' + okvedText;
            };
        }])
        //
        .filter('targetRelationsInfo', ['$filter', function($filter){
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
                    }
                };

                function isTargetRelation(relation) {
                    return relation._type === data.relationInfo.relationType;
                }

                function getRelationText(relation, properties) {
                    var t = [];

                    _.each(properties, function(p){
                        if (relation[p.name]) {
                            var v = p.filter ? p.filter(relation[p.name]) : relation[p.name];
                            if (v) {
                                t.push(v);
                            }
                        }
                    });

                    return t.join(', ');
                }

                function getFounderText(relation) {
                    if (relation.sharePercent || relation.shareAmount) {
                        return _trc("доля", "Доля в учреждении компании") + nbsp +
                            (relation.sharePercent ? $filter('share')(relation.sharePercent, 2) + '%' : '') +
                            (relation.sharePercent && relation.shareAmount ? nbsp + nbsp : '') +
                            (relation.shareAmount ? $filter('number')(relation.shareAmount) + nbsp + _tr("руб.") : '');
                    }

                    return isTargetRelation(relation) ? '' : _tr("учредитель");
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

                            return v.join(', ');
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

                    return isTargetRelation(relation) ? '' : _tr("аффилированное лицо");
                }

                function getExecutiveText(relation) {
                    if (relation.position) {
                        return relation.position;
                    }

                    return isTargetRelation(relation) ? '' : _tr("руководитель");
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

                    return isTargetRelation(relation) ? '' : _tr("сотрудник");
                }

                function getParticipantText(relation) {
                    var t = getRelationText(relation, [{
                        name: 'status',
                        filter: _tr
                    }, {
                        name: 'price',
                        filter: function(v) {
                            return $filter('number')(v, 0) + nbsp + _tr(data.node.currency || node.currency);
                        }
                    }, {
                        name: 'lot',
                        filter: function(v) {
                            return _trc("лот", "лот в закупке") + nbsp + v;
                        }
                    }]);

                    if (t) {
                        return t;
                    }

                    return isTargetRelation(relation) ? '' : _tr("участник");
                }

                function getCommissionMemberText(relation) {
                    if (relation.role) {
                        return relation.role;
                    }

                    return isTargetRelation(relation) ? '' : _tr("член комиссии");
                }

                function getInnText(inn) {
                    return _tr("ИНН") + nbsp + inn;
                }

                var relations   = data.relationInfo.relationMap[node.__uid][data.relationInfo.direction],
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

                return _.capitalize(texts.join(', '));
            };
        }])
        //
        // TODO перенести в commons
        .filter('share', ['$filter', function($filter){
            return function(number, maxFractionSize){
                if (number > 100) {
                    return $filter('number')(number, maxFractionSize);
                }

                var numberText = $filter('number')(
                    number,
                    maxFractionSize === 0 ? 0 : maxFractionSize || 10
                );

                var text = /[.,]/.test(numberText) ?
                    numberText.replace(/[0]+$/, '').replace(/[.,]$/, '') :
                    numberText;

                return text;
            };
        }]);
    //
});
