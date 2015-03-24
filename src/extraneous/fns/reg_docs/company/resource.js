/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular');
                  require('np.resource');

    return angular.module('np.extraneous-fns-reg-docs-company-resource', ['np.resource'])
        //
        .constant('npExtraneousFnsRegDocsCompanyResourceConfig', {
            'search': {
                url: '/extraneous/fns/company/reg_docs'
            }
        })
        //
        .factory('npExtraneousFnsRegDocsCompanyResource', ['$log', '$q', '$http', 'npExtraneousFnsRegDocsCompanyResourceConfig', 'npResource', function($log, $q, $http, npExtraneousFnsRegDocsCompanyResourceConfig, npResource){

            var searchConfig = npExtraneousFnsRegDocsCompanyResourceConfig['search'];

            // API
            return {
                docSearch: function(options) {
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
