/**
 * @module rsearch-filters
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var template        = require('text!./views/rsearch-filters.html');

                          require('jquery');
                          require('underscore');
    var i18n            = require('i18n'),
        angular         = require('angular');

    return angular.module('np.rsearch-filters', [])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('npRsearchFilters', ['$log', '$rootScope', function($log, $rootScope){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                link: function(scope, element, attrs) {

                    /*
                     * region filter
                     *
                     */
                    var regionFilter = {
                        show: false,

                        isShow: function(){
                            return regionFilter.show;
                        },

                        isNoFilter: function(){
                            return _.size(regionFilter.sortedRegionCodes) === 1;
                        },

                        doFilter: function(value){
                            regionFilter.value = value;
                            regionFilter.data.callback(value);
                        }
                    };

                    $rootScope.$on('np-rsearch-filters-toggle-region-filter', function(e, show){
                        regionFilter.show = show;
                    });

                    $rootScope.$on('np-rsearch-filters-set-region-filter-data', function(e, data){
                        regionFilter.data = data;
                        regionFilter.sortedRegionCodes = sortByCount(data.regionCodes);
                        regionFilter.value = data.value;
                    });

                    /*
                     * scope
                     *
                     */
                    _.extend(scope, {
                        regionFilter: regionFilter
                    }, i18n.translateFuncs);

                    /*
                     * utils
                     *
                     */
                    function sortByCount(data) {
                        if (!data) {
                            return null;
                        }

                        var list = _.pairs(data);

                        return _.sortBy(list, function(p){
                            return -p[1];
                        });
                    }
                }
            };
        }]);
    //
});
