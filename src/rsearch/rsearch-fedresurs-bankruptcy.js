/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('lodash');
        angular         = require('angular');

    //
    var BY_NODE_TYPE = {
        'COMPANY': {
            searchType: 'COMPANY',
            getMessageSearch: function(node) {
                return {
                    'ogrn': node['ogrn']
                };
            }
        },
        'INDIVIDUAL_IDENTITY': {
            searchType: 'INDIVIDUAL',
            getMessageSearch: function(node) {
                return {
                    'inn': node['inn']
                };
            }
        },
        'INDIVIDUAL': {
            searchType: 'INDIVIDUAL',
            getMessageSearch: function(node) {
                return {
                    'name': node['name']
                };
            }
        }
    };

    return angular.module('np.rsearch-fedresurs-bankruptcy', [])
        //
        .factory('NpRsearchFedresursBankruptcy', ['$log', '$rootScope', '$timeout', 'npExtraneousFedresursBankruptcyHelper', 'npRsearchFedresursBankruptcyConfig', function($log, $rootScope, $timeout, npExtraneousFedresursBankruptcyHelper, npRsearchFedresursBankruptcyConfig){

            // Class
            return function() {
                var messageCountPending, messageCountRequest,
                    node;

                reset();

                function getSearchType() {
                    if (!isNodeValid(node)) {
                        return null;
                    }

                    return BY_NODE_TYPE[node._type].searchType;
                }

                function getMessageSearch() {
                    if (!isNodeValid(node)) {
                        return {};
                    }

                    return BY_NODE_TYPE[node._type].getMessageSearch(node);
                }

                function reset() {
                    messageCountPending = false;

                    abortMessageCountRequest();
                }

                function abortMessageCountRequest() {
                    if (messageCountRequest) {
                        messageCountRequest.abort();
                    }
                }

                function doGetMessageCount() {
                    var searchType      = getSearchType(),
                        messageSearch   = getMessageSearch();

                    messageCountPending = true;

                    abortMessageCountRequest();

                    messageCountRequest = npExtraneousFedresursBankruptcyHelper.getMessageCount(
                        searchType,
                        messageSearch,
                        function(result){
                            node.__fedresursBankruptcy.messageCount = result;
                            node.__fedresursBankruptcy.error = null;
                            messageCountPending = false;
                        },
                        function(){
                            node.__fedresursBankruptcy.messageCount = 0;
                            node.__fedresursBankruptcy.error = true;
                            messageCountPending = false;
                        });
                }

                function isNodeValid(n) {
                    return n && (n._type === 'COMPANY' || n._type === 'INDIVIDUAL_IDENTITY' || n._type === 'INDIVIDUAL');
                }

                function setNode(n) {
                    reset();

                    if (!isNodeValid(n)) {
                        return;
                    }

                    node = n;
                    node.__fedresursBankruptcy = {
                        messageCount: 0,
                        error: null
                    };

                    if (npRsearchFedresursBankruptcyConfig.gettingMessageCount) {
                        doGetMessageCount();
                    }
                }

                function isNodeWithData() {
                    return node && node.__fedresursBankruptcy;
                }

                // API
                return {
                    setNode: setNode,
                    getSearchType: getSearchType,
                    gettingMessageCount: function() {
                        return npRsearchFedresursBankruptcyConfig.gettingMessageCount;
                    },
                    isMessageCountPending: function() {
                        return messageCountPending;
                    },
                    getMessageCount: function() {
                        return isNodeWithData() ? node.__fedresursBankruptcy.messageCount : 0;
                    },
                    hasError: function() {
                        return isNodeWithData() ? node.__fedresursBankruptcy.error : null;
                    },
                    showMessages: function() {
                        $timeout(function(){
                            $rootScope.$emit('np-extraneous-fedresurs-bankruptcy-do-search', {
                                search: getMessageSearch()
                            });
                        });
                    },
                    clear: function() {
                        reset();
                        $rootScope.$emit('np-extraneous-fedresurs-bankruptcy-do-clear');
                    }
                };
            };
        }]);
    //
});
