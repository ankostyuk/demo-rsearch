/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('lodash');
        angular         = require('angular');

    return angular.module('np.rsearch-fns-reg-docs', [])
        //
        .factory('NpRsearchFnsRegDocsCompany', ['$log', '$rootScope', '$timeout', 'npExtraneousFnsRegDocsCompanyHelper', 'npRsearchFnsRegDocsConfig', function($log, $rootScope, $timeout, npExtraneousFnsRegDocsCompanyHelper, npRsearchFnsRegDocsConfig){

            // Class
            return function() {
                var docCountPending, docCountRequest,
                    node;

                reset();

                function getDocSearch() {
                    return {
                        'ogrn': node['ogrn']
                    };
                }

                function reset() {
                    docCountPending = false;

                    abortDocCountRequest();
                }

                function abortDocCountRequest() {
                    if (docCountRequest) {
                        docCountRequest.abort();
                    }
                }

                function doGetDocCount() {
                    var docSearch = getDocSearch();

                    docCountPending = true;

                    abortDocCountRequest();

                    docCountRequest = npExtraneousFnsRegDocsCompanyHelper.getDocCount(
                        docSearch,
                        function(result){
                            node.__fnsRegDocs.docCount = result;
                            node.__fnsRegDocs.error = null;
                            docCountPending = false;
                        },
                        function(){
                            node.__fnsRegDocs.docCount = 0;
                            node.__fnsRegDocs.error = true;
                            docCountPending = false;
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
                    node.__fnsRegDocs = {
                        docCount: 0,
                        error: null
                    };

                    if (npRsearchFnsRegDocsConfig.gettingDocCount) {
                        doGetDocCount();
                    }
                }

                function isNodeWithData() {
                    return node && node.__fnsRegDocs;
                }

                // API
                return {
                    setNode: setNode,
                    gettingDocCount: function() {
                        return npRsearchFnsRegDocsConfig.gettingDocCount;
                    },
                    isDocCountPending: function() {
                        return docCountPending;
                    },
                    getDocCount: function() {
                        return isNodeWithData() ? node.__fnsRegDocs.docCount : 0;
                    },
                    hasError: function() {
                        return isNodeWithData() ? node.__fnsRegDocs.error : null;
                    },
                    showDocs: function() {
                        $timeout(function(){
                            $rootScope.$emit('np-extraneous-fns-reg-docs-company-do-search', {
                                search: getDocSearch()
                            });
                        });
                    },
                    clear: function() {
                        reset();
                        $rootScope.$emit('np-extraneous-fns-reg-docs-company-do-clear');
                    }
                };
            };
        }]);
    //
});
