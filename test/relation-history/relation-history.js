//
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular'),
        moment  = require('moment');

    //
    var purl                = require('purl'),
        locationSearch      = purl().param(),
        __collapseRelations = locationSearch['collapse-relations'] === 'true' ? true : false,
        __maxActualDate     = locationSearch['max-actual-date'] ? moment(locationSearch['max-actual-date']).valueOf() : null;

    console.warn('relation-history::__collapseRelations', __collapseRelations);
    console.warn('relation-history::__maxActualDate', __maxActualDate ? moment(__maxActualDate).format() : __maxActualDate);

    //
    return angular.module('np.relation-history', [])
        //
        .factory('npRelationHistory', ['$log', function($log){

            // Мета для источников данных.
            // * `priority` - приоритет источника.
            //      Параметр используется для:
            //      * "дополнительной актуальности"
            //      * исключения неоднозначности при сортировках и схлопывании связей
            //
            var sourceMeta = {
                // информативный и часто обновляемый источник
                'egrul': {
                    priority: 500
                },
                // информативный источник
                'xegrul': {
                    priority: 400
                },
                // информативный источник, но не поддерживающий (пока) историю связей
                'rosstat': {
                    priority: 300
                },
                // информативный источник, но "старый"
                'eaf': {
                    priority: 200
                },
                // часто обновляемый источник, но ограниченно информативный
                'egrul_individual_founder': {
                    priority: 100
                },
                // часто обновляемый источник, но ограниченно информативный
                'egrul_individual_executive': {
                    priority: 100
                }
            };

            //
            // Вспомогательные методы
            //

            // Проверяет связь на "строгую актуальность".
            //
            function isStrictActuality(relation) {
                return isExecutiveRelation(relation);
            }

            // Схлопывает две связи.
            // Результат схлопывания в связи `r1`.
            //
            function mergeRelations(r1, r2) {
                if (isFounderRelation(r1)) {
                    return mergeFounderRelations(r1, r2);
                } else
                if (isExecutiveRelation(r1)) {
                    return mergeExecutiveRelations(r1, r2);
                }
            }

            // Схлопывает две связи Учредитель.
            // Результат схлопывания в связи `r1`.
            // Пытается установить непустые значения свойств.
            // Приоритет значений устанавливаемых свойств
            // при равенстве дат действия у связи с большим приоритетом источника,
            // иначе у связи с большей датой актуальности источника.
            //
            function mergeFounderRelations(r1, r2) {
                if (r2._since === r1._since) {
                    r1.shareAmount = sourceMeta[r2._source].priority > sourceMeta[r1._source].priority ?
                        (r2.shareAmount || r1.shareAmount || null) :
                        (r1.shareAmount || r2.shareAmount || null);

                    r1.sharePercent = sourceMeta[r2._source].priority > sourceMeta[r1._source].priority ?
                        (r2.sharePercent || r1.sharePercent || null) :
                        (r1.sharePercent || r2.sharePercent || null);
                } else
                if (r2._actual > r1._actual) {
                    r1.shareAmount = r2.shareAmount || r1.shareAmount || null;
                    r1.sharePercent = r2.sharePercent || r1.sharePercent || null;
                } else {
                    r1.shareAmount = r1.shareAmount || r2.shareAmount || null;
                    r1.sharePercent = r1.sharePercent || r2.sharePercent || null;
                }

                mergeINN(r1, r2);
                mergeSource(r1, r2);
            }

            // Схлопывает две связи Руководитель.
            // Результат схлопывания в связи `r1`.
            // Пытается установить непустые значения свойств.
            // Приоритет значений устанавливаемых свойств
            // при равенстве дат действия у связи с большим приоритетом источника,
            // иначе у связи с большей датой актуальности источника.
            //
            function mergeExecutiveRelations(r1, r2) {
                if (r2._since === r1._since) {
                    r1.position = sourceMeta[r2._source].priority > sourceMeta[r1._source].priority ?
                        (r2.position || r1.position || null) :
                        (r1.position || r2.position || null);
                } else
                if (r2._actual > r1._actual) {
                    r1.position = r2.position || r1.position || null;
                } else {
                    r1.position = r1.position || r2.position || null;
                }

                mergeINN(r1, r2);
                mergeSource(r1, r2);
            }

            // Схлопывает свойства ИНН двух связей.
            // Схлопывает только у типов связей:
            //  * FOUNDER_INDIVIDUAL
            //  * EXECUTIVE_INDIVIDUAL
            //
            // Результат схлопывания в связи `r1`.
            // Пытается установить непустые значения ИНН.
            // Приоритет значений устанавливаемых ИНН
            // при равенстве дат действия у связи с большим приоритетом источника,
            // иначе у связи с большей датой актуальности источника.
            //
            function mergeINN(r1, r2) {
                if (!isMergeINN(r1)) {
                    return;
                }

                if (r2._since === r1._since) {
                    r1.inn = sourceMeta[r2._source].priority > sourceMeta[r1._source].priority ?
                        (r2.inn || r1.inn || null) :
                        (r1.inn || r2.inn || null);
                } else
                if (r2._actual > r1._actual) {
                    r1.inn = r2.inn || r1.inn || null;
                } else {
                    r1.inn = r1.inn || r2.inn || null;
                }
            }

            // Схлопывает свойства источников двух связей.
            // Результат схлопывания в связи `r1`.
            // * дата действия -- минимальная
            // * дата актуальности -- максимальная
            // * наименование источника -- с большей датой актуальности
            //
            function mergeSource(r1, r2) {
                r1._since = Math.min(r1._since, r2._since);
                r1._actual = Math.max(r1._actual, r2._actual);
                r1._source = (r2._actual > r1._actual ? r2._source : r1._source);
            }

            // Проверяет можно ли схлопнуть связи.
            //
            function isRelationsCollapsed(r1, r2) {
                if (isFounderRelation(r1)) {
                    return isFounderRelationsCollapsed(r1, r2);
                } else
                if (isExecutiveRelation(r1)) {
                    return isExecutiveRelationsCollapsed(r1, r2);
                }

                return false;
            }

            // Проверяет можно ли схлопнуть связи Учредитель.
            // Проверяет по:
            // * равенству дат действия
            // * нестрогому равенству свойств связей:
            //      * Доля в руб. -- с округлением до целого
            //      * Доля в % -- с округлением до 2-го дробного знака
            //
            function isFounderRelationsCollapsed(r1, r2) {
                return (r1._since === r2._since) ||  (
                    (r1.shareAmount || r2.shareAmount || 0).toFixed(0) === (r2.shareAmount || r1.shareAmount || 0).toFixed(0) &&
                    (r1._source === 'egrul_individual_founder' || r2._source === 'egrul_individual_founder' ? true :
                        (r1.sharePercent || r2.sharePercent || 0).toFixed(2) === (r2.sharePercent || r1.sharePercent || 0).toFixed(2)
                    )
                );
            }

            // Проверяет можно ли схлопнуть связи Руководитель.
            // Проверяет по:
            // * равенству дат действия
            // * нестрогому равенству свойств связей:
            //      * Должность -- приведение к одному регистру
            //
            function isExecutiveRelationsCollapsed(r1, r2) {
                return (r1._since === r2._since) || (
                    (r1.position || r2.position || '').toLowerCase() === (r2.position || r1.position || '').toLowerCase()
                );
            }

            // Проверяет отностится ли связь к типу Учредитель.
            //
            function isFounderRelation(relation) {
                return relation._type === 'FOUNDER_INDIVIDUAL' || relation._type === 'FOUNDER_COMPANY';
            }

            // Проверяет отностится ли связь к типу Руководитель.
            //
            function isExecutiveRelation(relation) {
                return relation._type === 'EXECUTIVE_INDIVIDUAL' || relation._type === 'EXECUTIVE_COMPANY';
            }

            // Проверяет схлопывать ли ИНН связи.
            //
            function isMergeINN(relation) {
                return relation._type === 'FOUNDER_INDIVIDUAL' || relation._type === 'EXECUTIVE_INDIVIDUAL';
            }

            // API
            return {
                // Выставляет актуальность свзей.
                // Схлопывает связи.
                //
                buildActuality: function(node) {
                    $log.warn('* buildActuality...', node._type, node._id);

                    if (node._type !== 'COMPANY') {
                        $log.warn('< не выставляем актуальность для нод типа', node._type);
                        return;
                    }

                    // Предобработка связей для тестирования алгоритма.
                    // Данный код не должен идти в продакшн.
                    //
                    if (__maxActualDate) {
                        node._relations = _.filter(node._relations, function(relation){
                            // удаляем связи из "свежих данных"
                            if (relation._actual > __maxActualDate) {
                                return false;
                            }

                            return true;
                        });
                    }

                    //
                    // Актуальность
                    //

                    var relationMap = {
                        'FOUNDERS': {
                            'all': [],
                            'aggregated': {},
                            'sorted': []
                        },
                        'EXECUTIVES': {
                            'all': [],
                            'aggregated': {},
                            'sorted': []
                        }
                    };

                    // Сгруппировать по типам, для которых выставляем актуальность:
                    // * Учредители
                    // * Руководители
                    //
                    _.each(node._relations, function(relation){
                        // Только входящие связи
                        if (relation._dstId !== node._id) {
                            return;
                        }

                        if (isFounderRelation(relation)) {
                            relationMap['FOUNDERS']['all'].push(relation);
                        } else
                        if (isExecutiveRelation(relation)) {
                            relationMap['EXECUTIVES']['all'].push(relation);
                        }
                    });

                    // Сгруппировать по
                    // <источник>+<дата источника>
                    //
                    _.each(relationMap, function(byType){
                        var all         = byType['all'],
                            aggregated  = byType['aggregated'];

                        _.each(all, function(relation){
                            var key = relation._source + '::' + relation._actual;

                            if (!_.has(aggregated, key)) {
                                aggregated[key] = [];
                            }

                            aggregated[key].push(relation);
                        });
                    });

                    // Отсортировать группы <источник>+<дата источника> в последованности:
                    // 1. по убыванию максимальной даты начала действия в наборе связей в группе
                    // 2. по убыванию приоритета источника
                    // 3. по убыванию даты актуальности источника
                    //
                    _.each(relationMap, function(byType){
                        byType['sorted'] = _.sortByOrder(byType['aggregated'],
                            [function(relations){
                                var maxDate = 0;

                                _.each(relations, function(relation){
                                    maxDate = Math.max(maxDate, relation._since);
                                });

                                return maxDate;
                            },
                            function(relations){
                                var relation = relations[0];
                                return sourceMeta[relation._source].priority;
                            },
                            function(relations){
                                var relation = relations[0];
                                return relation._actual;
                            }],
                            ['desc', 'desc', 'desc']
                        );
                    });

                    // Связи в первой группе актуальные,
                    // в следующих группах:
                    // актуальные, если
                    //  * связь "нестрогой актуальности"
                    //  и
                    //      * приоритет источника выше
                    //      приоритета источника в первой группе
                    //      (только в первой попавшейся группе с таким условием)
                    //      или
                    //      * дата актуальности источника больше или равна
                    //      дате актуальности источника в первой группе,
                    // иначе -- неактуальные.
                    //
                    _.each(relationMap, function(byType){
                        var priorityConditionIndex = 0,
                            actual, priority, priorityCondition, outdated;

                        _.each(byType['sorted'], function(relations, i){
                            if (isStrictActuality(relations[0])) {
                                outdated = i > 0;
                            } else {
                                actual = (i === 0 ? relations[0]._actual : actual);
                                priority = (i === 0 ? sourceMeta[relations[0]._source].priority : priority);

                                if (priorityConditionIndex === 0) {
                                    priorityCondition = sourceMeta[relations[0]._source].priority > priority;
                                    priorityConditionIndex = priorityCondition ? i : priorityConditionIndex;
                                }

                                outdated = !(
                                    i === 0 ||
                                    i === priorityConditionIndex ||
                                    relations[0]._actual >= actual
                                );
                            }

                            _.each(relations, function(relation){
                                relation.outdated = outdated;
                            });
                        });
                    });

                    //
                    $log.info('< relationMap:', relationMap);

                    //
                    // Схлопывание связей
                    //
                    // Схлопываются только входящие связи тех типов,
                    // для которых выставляется актуальность.
                    // Остальные связи отстаются без изменений.
                    //
                    // При схлопывании связей выставляется неактуальность
                    // у "лишних" актуальных связей
                    // -- актуальной должна быть только одна связь
                    // определенного типа между двумя объектами.
                    //
                    // TODO схлопывать все связи, где возможны дубликаты:
                    // адреса, телефоны, ...
                    //

                    if (!__collapseRelations) {
                        return;
                    }

                    var collapseRelationMap = {
                        aggregated: {},
                        _relations: []
                    };

                    // Сгруппировать схлопываемые связи по
                    // <тип связи>+<идентификатор родительской ноды>
                    //
                    // Остальные связи сохранить
                    //
                    _.each(node._relations, function(relation){
                        var key = null;

                        if (relation._dstId === node._id && (
                            isFounderRelation(relation) ||
                            isExecutiveRelation(relation))) {
                            //
                            key = relation._type + '::' + relation._srcId;
                        }

                        if (!key) {
                            collapseRelationMap._relations.push(relation);
                            return;
                        }

                        if (!_.has(collapseRelationMap.aggregated, key)) {
                            collapseRelationMap.aggregated[key] = [];
                        }

                        collapseRelationMap.aggregated[key].push(relation);
                    });

                    // Отсортировать связи в каждой группе в последованности:
                    // 1. по возрастанию флага неактуальности
                    // 2. по убыванию даты действия
                    // 3. по убыванию даты актуальности источника
                    //
                    // Убрать "лишнюю актуальность"
                    //
                    // Схлопнуть связи в каждой группе
                    //
                    _.each(collapseRelationMap.aggregated, function(relations, key){
                        relations = _.sortByOrder(relations,
                            ['outdated', '_since', '_actual'],
                            ['asc', 'desc', 'desc']
                        );

                        var r1                  = relations[0],
                            collapsedRelations  = [r1],
                            r2, i;

                        // Первая связь может быть как актуальной, так и неактуальной
                        for (i = 1; i < _.size(relations); i++) {
                            r2 = relations[i];

                            // Остальные связи неактуальные
                            r2.outdated = true;

                            if (isRelationsCollapsed(r1, r2)) {
                                mergeRelations(r1, r2);
                            } else {
                                collapsedRelations.push(r2);
                                r1 = r2;
                            }
                        }

                        collapseRelationMap._relations =
                            collapseRelationMap._relations.concat(collapsedRelations);
                    });

                    //
                    $log.info('< collapseRelationMap:', collapseRelationMap);

                    //
                    node._relations = collapseRelationMap._relations;
                }
            };
        }]);
    //
});
