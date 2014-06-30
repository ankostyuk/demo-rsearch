/**
 * @module rsearch-meta
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
// TODO объеденить код со "связями"
define(function(require) {'use strict';
    var root = window;

    var angular = require('angular');

    var metaConfig = root._APP_CONFIG.meta;

    var MetaSettings = {
        lastSalesVolumeField: metaConfig.lastSalesVolumeField,
        currencyOrder: 1000
    };

    return angular.module('np.rsearch-meta', [])
        //
        .constant('npRsearchMeta', {
            nodes: {
                types: {
                    'COMPANY': {
                        searchResultPriority: 4
                    },
                    'INDIVIDUAL': {
                        searchResultPriority: 3
                    },
                    'ADDRESS': {
                        searchResultPriority: 2
                    },
                    'PHONE': {
                        searchResultPriority: 1
                    }
                }
            }
        })
        .filter('isLastSalesVolume', [function(){
            return function(node){
                if (!node) {
                    return null;
                }

                return _.has(node, MetaSettings.lastSalesVolumeField);
            };
        }])
        //
        .filter('lastSalesVolume', [function(){
            return function(node){
                if (!node) {
                    return null;
                }

                return node[MetaSettings.lastSalesVolumeField] / MetaSettings.currencyOrder;
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
        .filter('OKVED', [function(){
            return function(node){
                if (!node) {
                    return null;
                }

                var okved = node['okvedcode_bal'] || node['okvedcode_main'];

                if (!okved) {
                    return null;
                }

                var okvedCode = _.chop(okved, 2).join('.');
                var okvedText = node['okved_bal_text'] || node['okved_main_text'];

                return okvedCode + ' ' + okvedText;
            };
        }])
        //
        .factory('npRsearchMetaHelper', ['$log', 'npRsearchMeta', function($log, npRsearchMeta){

            return {
                getNodeTypes: function() {
                    return npRsearchMeta.nodes.types;
                }
            };
        }]);
    //
});
