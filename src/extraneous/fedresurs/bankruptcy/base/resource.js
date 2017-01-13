/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular');
                  require('np.resource');

    return angular.module('np.extraneous-fedresurs-bankruptcy-resource', ['np.resource'])
        //
        .constant('npExtraneousFedresursBankruptcyResourceConfig', {
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
        .factory('npExtraneousFedresursBankruptcyResource', ['$log', '$q', '$http', 'npExtraneousFedresursBankruptcyResourceConfig', 'npResource', function($log, $q, $http, npExtraneousFedresursBankruptcyResourceConfig, npResource){

            var searchConfig = npExtraneousFedresursBankruptcyResourceConfig['search'];

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
