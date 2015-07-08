/**
 * @module rsearch-filters
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var regionFilterTemplate            = require('text!./views/rsearch-region-filter.html'),
        innFilterTemplate               = require('text!./views/rsearch-inn-filter.html'),
        affiliatedCauseFilterTemplate   = require('text!./views/rsearch-affiliated-cause-filter.html'),
        relationDateFilterTemplate      = require('text!./views/rsearch-relation-date-filter.html'),
        timelineFilterTemplate          = require('text!./views/rsearch-timeline-filter.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular');

                          require('angular-ui-slider');

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
    return angular.module('np.rsearch-filters', ['ui.slider'])
        //
        .run([function(){
            regionFilterTemplate = i18n.translateTemplate(regionFilterTemplate);
            innFilterTemplate = i18n.translateTemplate(innFilterTemplate);
            affiliatedCauseFilterTemplate = i18n.translateTemplate(affiliatedCauseFilterTemplate);
            relationDateFilterTemplate = i18n.translateTemplate(relationDateFilterTemplate);
            timelineFilterTemplate = i18n.translateTemplate(timelineFilterTemplate);
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
                        },
                        filter: filter
                    }, i18n.translateFuncs);
                }
            };
        }])
        //
        .directive('npRsearchTimelineFilter', ['$log', '$rootScope', function($log, $rootScope){
            return {
                restrict: 'A',
                template: timelineFilterTemplate,
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
                        dateIndexes: [0, 0],
                        slider: {
                            options: {
                                range: true,
                                min: 0,
                                max: 0,
                                slide: function(event, ui) {
                                    var pairs       = filter.getSortedPairs(),
                                        dateFrom    = pairs[scope.dateIndexes[0]][0],
                                        dateTo      = pairs[scope.dateIndexes[1]][0];

                                    filter.doFilter([dateFrom, dateTo]);
                                }
                            }
                        },
                        toggle: function(show) {
                            filter.toggle(show);
                        },
                        setData: function(data) {
                            filter.setData(data, function(pair){
                                var byDate = pair[1];
                                return byDate.date;
                            });

                            var max         = _.size(data.values) - 1,
                                dateIndexes = scope.dateIndexes;

                            if (_.size(data.value) === 2) {
                                dateIndexes[0] = getIndexByDate(data.value[0]);
                                dateIndexes[1] = getIndexByDate(data.value[1]);
                            } else {
                                dateIndexes[0] = 0;
                                dateIndexes[1] = max;
                            }

                            scope.slider.options.max = max;
                        },
                        filter: filter
                    }, i18n.translateFuncs);

                    function getIndexByDate(date) {
                        return _.findIndex(filter.getSortedPairs(), function(pair){
                            return pair[0] === date;
                        });
                    }
                }
            };
        }]);
    //
});
