/**
 * @module rsearch-filters
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var regionFilterTemplate            = require('text!./views/rsearch-region-filter.html'),
        innFilterTemplate               = require('text!./views/rsearch-inn-filter.html'),
        affiliatedCauseFilterTemplate   = require('text!./views/rsearch-affiliated-cause-filter.html'),
        relationDateFilterTemplate      = require('text!./views/rsearch-relation-date-filter.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular');

    // <<< @Deprecated relation_history
    // Временное решение для отладки истории связей
    var purl                = require('purl'),
        locationSearch      = purl().param(),
        _isSinceInterval    = locationSearch['_since_interval'] === 'true';
    // >>>

    //
    function Filter(options) {
        options = options || {};

        var data        = null,
            value       = null,
            isShow      = false,
            sortedPairs = [];

        return {
            setData: function(d, sort) {
                data = d;
                value = data.value;
                sortedPairs = sortBy(data.values, sort);
            },

            getSortedPairs: function() {
                return sortedPairs;
            },

            getValue: function() {
                return value;
            },

            toggle: function(show) {
                isShow = show;
            },

            isShow: function() {
                if (_.isFunction(options.isShow)) {
                    return options.isShow(isShow, data, sortedPairs);
                }

                return isShow;
            },

            isNoFilter: function() {
                if (_.isFunction(options.isNoFilter)) {
                    return options.isNoFilter(data, sortedPairs);
                }

                return !!(data && _.size(sortedPairs) === 1 && sortedPairs[0][1] === data.total);
            },

            doFilter: function(v) {
                if (value === v) {
                    return;
                }
                value = v;
                data.callback(value, sortedPairs);
            }
        };
    }

    function sortBy(data, sort) {
        if (!data) {
            return [];
        }

        var list = _.pairs(data);

        if (sort === 'byKey') {
            return _.sortBy(list, function(p){
                return p[0];
            });
        } else if (_.isFunction(sort)) {
            return _.sortBy(list, function(p){
                return sort(p);
            });
        }

        return _.sortBy(list, function(p){
            return -p[1];
        });
    }

    //
    return angular.module('np.rsearch-filters', [])
        //
        .run([function(){
            regionFilterTemplate = i18n.translateTemplate(regionFilterTemplate);
            innFilterTemplate = i18n.translateTemplate(innFilterTemplate);
            affiliatedCauseFilterTemplate = i18n.translateTemplate(affiliatedCauseFilterTemplate);
            relationDateFilterTemplate = i18n.translateTemplate(relationDateFilterTemplate);
        }])
        //
        .directive('npRsearchRegionFilter', ['$log', '$rootScope', function($log, $rootScope){
            return {
                restrict: 'A',
                template: regionFilterTemplate,
                scope: {},
                link: function(scope, element, attrs) {
                    var filter = new Filter();

                    _.extend(scope, {
                        toggle: function(show) {
                            filter.toggle(show);
                        },
                        setData: function(data) {
                            filter.setData(data);
                        },
                        filter: filter
                    }, i18n.translateFuncs);
                }
            };
        }])
        //
        .directive('npRsearchInnFilter', ['$log', '$rootScope', function($log, $rootScope){
            return {
                restrict: 'A',
                template: innFilterTemplate,
                scope: {},
                link: function(scope, element, attrs) {
                    var filter = new Filter();

                    _.extend(scope, {
                        toggle: function(show) {
                            filter.toggle(show);
                        },
                        setData: function(data) {
                            noInnCount = _.reduce(data.values, function(c, v){
                                return c - v;
                            }, data.total);

                            filter.setData(data, 'byKey');
                        },
                        filter: filter
                    }, i18n.translateFuncs);

                    //
                    var noInnCount;

                    filter.getNoInnCount = function() {
                        return noInnCount;
                    };
                }
            };
        }])
        //
        .directive('npRsearchAffiliatedCauseFilter', ['$log', '$rootScope', function($log, $rootScope){
            var causesMeta = {
                'AFFILIATE_SOLE_EXECUTIVE': {
                    order: 10
                },
                'AFFILIATE_MEMBER_BOARD_DIRECTORS': {
                    order: 20
                },
                'AFFILIATE_20_PERCENT': {
                    order: 30
                },
                'AFFILIATE_SAME_GROUP': {
                    order: 40
                }
            };

            return {
                restrict: 'A',
                template: affiliatedCauseFilterTemplate,
                scope: {},
                link: function(scope, element, attrs) {
                    var filter = new Filter();

                    _.extend(scope, {
                        toggle: function(show) {
                            filter.toggle(show);
                        },
                        setData: function(data) {
                            filter.setData(data, function(pair){
                                var causeMeta = causesMeta[pair[0]];
                                return causeMeta ? causeMeta.order : null;
                            });
                        },
                        filter: filter
                    }, i18n.translateFuncs);
                }
            };
        }])
        //
        .directive('npRsearchRelationDateFilter', ['$log', '$rootScope', function($log, $rootScope){
            return {
                restrict: 'A',
                template: relationDateFilterTemplate,
                scope: {},
                link: function(scope, element, attrs) {
                    var filter = new Filter({
                        isShow: function(isShow, data, sortedPairs) {
                            return (isShow && data && _.size(data.values) > 1);
                        },
                        isNoFilter: function(data, sortedPairs) {
                            return false;
                        }
                    });

                    _.extend(scope, {
                        toggle: function(show) {
                            filter.toggle(show);
                        },
                        setData: function(data) {
                            filter.setData(data, function(pair){
                                var byDate = pair[1];
                                return -byDate.date;
                            });


                            // @Deprecated relation_history
                            // Временное решение для отладки истории связей
                            // TODO Сделать API и нормальный фильтр
                            _.each(filter.getSortedPairs(), function(pair){
                                var byDate = pair[1];
                                byDate._max = (_.max(byDate.relations, '_since'))['_since'];
                                byDate._min = _isSinceInterval ? (_.min(byDate.relations, '_since'))['_since'] : null;
                                byDate._min = (byDate._min === byDate._max ? null : byDate._min);
                            });
                        },
                        filter: filter
                    }, i18n.translateFuncs);
                }
            };
        }]);
    //
});
