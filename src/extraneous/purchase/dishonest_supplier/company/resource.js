/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular');
                  require('np.resource');

    return angular.module('np.extraneous-purchase-dishonest-supplier-company-resource', ['np.resource'])
        //
        .constant('npExtraneousPurchaseDishonestSupplierCompanyResourceConfig', {
            'search': {
                url: '/extraneous/purchase/company/dishonest_supplier'
            }
        })
        //
        .factory('npExtraneousPurchaseDishonestSupplierCompanyResource', ['$log', '$q', '$http', 'npExtraneousPurchaseDishonestSupplierCompanyResourceConfig', 'npResource', function($log, $q, $http, npExtraneousPurchaseDishonestSupplierCompanyResourceConfig, npResource){

            var searchConfig = npExtraneousPurchaseDishonestSupplierCompanyResourceConfig['search'];

            // API
            return {
                recSearch: function(options) {
                    return npResource.request({
                        method: 'GET',
                        url: searchConfig.url,
                        params: options.search,
                    }, null, options);
                }
            };
        }]);
    //
});
