/**
 * @module rsearch-filters
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var regionFilterTemplate    = require('text!./views/rsearch-region-filter.html'),
        innFilterTemplate       = require('text!./views/rsearch-inn-filter.html');

                          require('jquery');
                          require('underscore');
    var i18n            = require('i18n'),
        angular         = require('angular');

    //
    function Filter() {
        var data        = null,
            value       = null,
            isShow      = false,
            sortedPairs = [];

        return {
            setData: function(d, sort){
                data = d;
                value = data.value;
                sortedPairs = sortBy(data.values, sort);
            },

            getSortedPairs: function(){
                return sortedPairs;
            },

            getValue: function(){
                return value;
            },

            toggle: function(show){
                isShow = show;
            },

            isShow: function(){
                return isShow;
            },

            isNoFilter: function(){
                return data && sortedPairs[0] && sortedPairs[0][1] === data.total;
            },

            doFilter: function(v){
                if (value === v) {
                    return;
                }
                value = v;
                data.callback(value);
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
        }]);
    //
});
