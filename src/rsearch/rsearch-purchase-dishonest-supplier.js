/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('lodash');
        angular         = require('angular');

    return angular.module('np.rsearch-purchase-dishonest-supplier', [])
        //
        .factory('NpRsearchPurchaseDishonestSupplierCompany', ['$log', '$rootScope', '$timeout', 'npExtraneousPurchaseDishonestSupplierCompanyHelper', 'npRsearchPurchaseDishonestSupplierConfig', function($log, $rootScope, $timeout, npExtraneousPurchaseDishonestSupplierCompanyHelper, npRsearchPurchaseDishonestSupplierConfig){

            // url template '...&searchText=<company_inn>...'
            var showRecsUrlTemplate = 'http://zakupki.gov.ru/epz/dishonestsupplier/dishonestSuppliersQuickSearch/search.html?placeOfSearch=FZ_44&_placeOfSearch=on&placeOfSearch=FZ_223&_placeOfSearch=on&dateOfInclusionStart=&dateOfInclusionEnd=&sortDirection=false&dishonestSupplierSimpleSorting=UPDATE_DATE&recordsPerPage=_10&pageNumber=1&searchText=<company_inn>&strictEqual=true&morphology=false';

            // Class
            return function() {
                var recCountPending, recCountRequest,
                    node, showRecsUrl;

                reset();

                function getRecSearch() {
                    return {
                        'inn': node['inn']
                    };
                }

                function reset() {
                    recCountPending = false;

                    abortRecCountRequest();
                }

                function abortRecCountRequest() {
                    if (recCountRequest) {
                        recCountRequest.abort();
                    }
                }

                function doGetRecCount() {
                    var recSearch = getRecSearch();

                    recCountPending = true;

                    abortRecCountRequest();

                    recCountRequest = npExtraneousPurchaseDishonestSupplierCompanyHelper.getRecCount(
                        recSearch,
                        function(result){
                            node.__purchaseDishonestSupplier.recCount = result;
                            node.__purchaseDishonestSupplier.error = null;
                            recCountPending = false;
                        },
                        function(){
                            node.__purchaseDishonestSupplier.recCount = 0;
                            node.__purchaseDishonestSupplier.error = true;
                            recCountPending = false;
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
                    node.__purchaseDishonestSupplier = {
                        recCount: 0,
                        error: null
                    };

                    showRecsUrl = showRecsUrlTemplate.replace(/<company_inn>/, node.inn);

                    if (npRsearchPurchaseDishonestSupplierConfig.gettingRecCount) {
                        doGetRecCount();
                    }
                }

                function isNodeWithData() {
                    return node && node.__purchaseDishonestSupplier;
                }

                // API
                return {
                    setNode: setNode,
                    gettingRecCount: function() {
                        return npRsearchPurchaseDishonestSupplierConfig.gettingRecCount;
                    },
                    isRecCountPending: function() {
                        return recCountPending;
                    },
                    getRecCount: function() {
                        return isNodeWithData() ? node.__purchaseDishonestSupplier.recCount : 0;
                    },
                    hasError: function() {
                        return isNodeWithData() ? node.__purchaseDishonestSupplier.error : null;
                    },
                    showRecs: function() {},
                    getShowRecsUrl: function() {
                        return showRecsUrl;
                    },
                    clear: function() {
                        reset();
                        $rootScope.$emit('np-extraneous-purchase-dishonest-supplier-company-do-clear');
                    }
                };
            };
        }]);
    //
});
