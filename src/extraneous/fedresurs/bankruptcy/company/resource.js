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
                'COMPANY': {
                    url: '/extraneous/fedresurs/company/bankruptcy'
                },
                'INDIVIDUAL': {
                    url: '/extraneous/fedresurs/individual/bankruptcy'
                }
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
                        url: searchConfig[options.searchType].url,
                        params: options.search,
                    }, null, options);
                }
            };
        }]);
    //
});
