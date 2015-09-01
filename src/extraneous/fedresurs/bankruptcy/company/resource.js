/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular');
                  require('np.resource');

    return angular.module('np.extraneous-fedresurs-bankruptcy-company-resource', ['np.resource'])
        //
        .constant('npExtraneousFedresursBankruptcyCompanyResourceConfig', {
            'search': {
                url: '/extraneous/fedresurs/company/bankruptcy'
            }
        })
        //
        .factory('npExtraneousFedresursBankruptcyCompanyResource', ['$log', '$q', '$http', 'npExtraneousFedresursBankruptcyCompanyResourceConfig', 'npResource', function($log, $q, $http, npExtraneousFedresursBankruptcyCompanyResourceConfig, npResource){

            var searchConfig = npExtraneousFedresursBankruptcyCompanyResourceConfig['search'];

            // API
            return {
                messageSearch: function(options) {
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
