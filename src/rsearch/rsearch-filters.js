/**
 * @module rsearch-filters
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var template                = require('text!./views/rsearch-filters.html'),
        regionFilterTemplate    = require('text!./views/rsearch-region-filter.html'),
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
            template = i18n.translateTemplate(template);
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

                    $rootScope.$on('np-rsearch-filters-toggle-region-filter', function(e, show){
                        filter.toggle(show);
                    });

                    $rootScope.$on('np-rsearch-filters-set-region-filter-data', function(e, data){
                        filter.setData(data);
                    });

                    _.extend(scope, {
                        filter: filter,
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

                    $rootScope.$on('np-rsearch-filters-toggle-inn-filter', function(e, show){
                        filter.toggle(show);
                    });

                    $rootScope.$on('np-rsearch-filters-set-inn-filter-data', function(e, data){
                        filter.setData(data, 'byKey');
                    });

                    _.extend(scope, {
                        filter: filter,
                    }, i18n.translateFuncs);
                }
            };
        }])
        //
        .directive('npRsearchFilters', ['$log', '$rootScope', function($log, $rootScope){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                link: function(scope, element, attrs) {
                }
            };
        }]);
    //
});
