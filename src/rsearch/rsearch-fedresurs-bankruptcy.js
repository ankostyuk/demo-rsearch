/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('lodash');
        angular         = require('angular');

    return angular.module('np.rsearch-fedresurs-bankruptcy', [])
        //
        .factory('NpRsearchFedresursBankruptcyCompany', ['$log', '$rootScope', '$timeout', 'npExtraneousFedresursBankruptcyCompanyHelper', 'npRsearchFedresursBankruptcyConfig', function($log, $rootScope, $timeout, npExtraneousFedresursBankruptcyCompanyHelper, npRsearchFedresursBankruptcyConfig){
            // TODO
            // сделать общий компонент: и для компаний, и для ИП, и для физиков
            // url в extraneous/fedresurs в зависимости от типа ноды -> привести в порядок getMessageSearch

            // Class
            return function() {
                var messageCountPending, messageCountRequest,
                    node;

                reset();

                function getMessageSearch() {
                    return {
                        'ogrn': node['ogrn']
                    };
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
                    var messageSearch = getMessageSearch();

                    messageCountPending = true;

                    abortMessageCountRequest();

                    messageCountRequest = npExtraneousFedresursBankruptcyCompanyHelper.getMessageCount(
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
                    return n._type === 'COMPANY';
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
                            $rootScope.$emit('np-extraneous-fedresurs-bankruptcy-company-do-search', {
                                search: getMessageSearch()
                            });
                        });
                    },
                    clear: function() {
                        reset();
                        $rootScope.$emit('np-extraneous-fedresurs-bankruptcy-company-do-clear');
                    }
                };
            };
        }]);
    //
});
