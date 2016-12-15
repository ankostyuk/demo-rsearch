/**
 * @module rsearch-navigation
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                      require('lodash');

    var i18n        = require('i18n'),
        angular     = require('angular');

    return angular.module('np.rsearch-autokad', [])
        //
        .factory('NpRsearchAutokad', ['$log', '$rootScope', '$timeout', 'npAutokadHelper', 'npRsearchAutokadConfig', function($log, $rootScope, $timeout, npAutokadHelper, npRsearchAutokadConfig){
            // Class
            return function() {
                var caseCountPending, caseCountRequest,
                    node;

                var byNodeType = {
                    'COMPANY': {
                        getCaseSearch: function() {
                            return {
                                sources: [
                                    {key: 'company_name',       value: node['nameshortsort']},
                                    {key: 'company_full_name',  value: node['namesort']},
                                    {key: 'company_ogrn',       value: node['ogrn']},
                                    {key: 'company_inn',        value: node['inn']}
                                ]
                            };
                        }
                    },
                    'INDIVIDUAL_IDENTITY': {
                        getCaseSearch: function() {
                            if (!node.selfemployedInfo) {
                                return null;
                            }

                            var byType = {
                                '1': {
                                    namePrefix: 'ИП',
                                    fullNamePrefix: 'Индивидуальный предприниматель'
                                },
                                '2': {
                                    namePrefix: 'КФХ',
                                    fullNamePrefix: 'Глава крестьянского (фермерского) хозяйства'
                                }
                            };

                            var type = _.get(node.selfemployedInfo.infoStatement, ['data', 'кодВидИП']);

                            return {
                                sources: [
                                    {key: 'selfemployed_name',      value: _.get(byType[type], 'namePrefix') + ' ' + node['name']},
                                    {key: 'selfemployed_full_name', value: _.get(byType[type], 'fullNamePrefix') + ' ' + node['name']},
                                    {key: 'selfemployed_inn',       value: node['inn']}
                                ]
                            };
                        }
                    },
                    'INDIVIDUAL': {
                        getCaseSearch: function() {
                            return {
                                sources: [
                                    {key: node.subtype === 'foreign' ? 'company_name' : 'individual_name', value: node['name']}
                                ]
                            };
                        }
                    }
                };

                reset();

                function reset() {
                    caseCountPending = false;

                    abortCaseCountRequest();
                }

                function abortCaseCountRequest() {
                    if (caseCountRequest) {
                        caseCountRequest.abort();
                    }
                }

                function doGetCaseCount() {
                    var caseSearch = byNodeType[node._type].getCaseSearch();

                    caseCountPending = true;

                    abortCaseCountRequest();

                    caseCountRequest = npAutokadHelper.getCaseCount(
                        caseSearch,
                        function(result, source){
                            node.__autokad.caseCount = result;
                            node.__autokad.searchSource = source;
                            node.__autokad.error = null;
                        },
                        function(){
                            $log.warn('getCaseCount... error');
                            node.__autokad.caseCount = 0;
                            node.__autokad.searchSource = null;
                            node.__autokad.error = true;
                        },
                        function(){
                            caseCountPending = false;
                        });
                }

                function isNodeValid(n) {
                    return !!byNodeType[n._type];
                }

                function setNode(n) {
                    reset();

                    if (!isNodeValid(n)) {
                        return;
                    }

                    node = n;
                    node.__autokad = {
                        caseCount: 0,
                        error: null
                    };

                    if (npRsearchAutokadConfig.gettingCaseCount) {
                        doGetCaseCount();
                    }
                }

                function isNodeWithAutokad() {
                    return node && node.__autokad;
                }

                // API
                return {
                    setNode: setNode,
                    gettingCaseCount: function() {
                        return npRsearchAutokadConfig.gettingCaseCount;
                    },
                    isCaseCountPending: function() {
                        return caseCountPending;
                    },
                    getCaseCount: function() {
                        return isNodeWithAutokad() ? node.__autokad.caseCount : 0;
                    },
                    hasError: function() {
                        return isNodeWithAutokad() ? node.__autokad.error : null;
                    },
                    showCases: function() {
                        $timeout(function(){
                            $rootScope.$emit('np-autokad-do-search', {
                                search: byNodeType[node._type].getCaseSearch(),
                                searchSource: node.__autokad.searchSource
                            });
                        });
                    },
                    clear: function() {
                        reset();
                        $rootScope.$emit('np-autokad-do-clear');
                    }
                };
            };
        }]);
    //
});
