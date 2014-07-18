/**
 * @module rsearch-meta
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
// TODO объеденить код со "связями"
define(function(require) {'use strict';

    var angular = require('angular');

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
        .filter('isLastSalesVolume', ['npRsearchConfig', function(npRsearchConfig){
            return function(node){
                if (!node) {
                    return null;
                }

                return _.has(node, npRsearchConfig.meta.lastSalesVolumeField);
            };
        }])
        //
        .filter('lastSalesVolume', ['npRsearchConfig', function(npRsearchConfig){
            return function(node){
                if (!node) {
                    return null;
                }

                return node[npRsearchConfig.meta.lastSalesVolumeField] / npRsearchConfig.meta.currencyOrder;
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

            var metaHelper = {

                getNodeTypes: function() {
                    return npRsearchMeta.nodes.types;
                },

                buildNodeExtraMeta: function(node){
                    if (!node) {
                        return;
                    }

                    // uid
                    //metaHelper.buildNodeUID(node);

                    // компания
                    if (node._type === 'COMPANY') {
                        // юридическое состояние
                        var egrulState  = node.egrul_state,
                            aliveCode   = 5, // Действующее
                            _liquidate;

                        if (egrulState && egrulState.code != aliveCode) {
                            _liquidate = {
                                state: {
                                    _actual: egrulState._actual,
                                    _since: egrulState._since,
                                    type: egrulState.type
                                }
                            };
                        } else
                        if (node.dead_dt) {
                            _liquidate = {
                                state: {
                                    _actual: null,
                                    _since: node.dead_dt,
                                    type: 'Ликвидировано' // TODO l10n|messages
                                }
                            };
                        }

                        node._liquidate = _liquidate;
                    }

                    // информация о связях
                    //nodeHelper.buildNodeRelationsInfo(node);
                }
            };

            return metaHelper;
        }]);
    //
});
