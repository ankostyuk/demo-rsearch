//
define(function(require) {'use strict';

    var angular = require('angular');
                  //require('angular-mocks');

    return angular.module('app.data', [])
        //
        .factory('dataMock', ['$log', '$httpBackend', 'npRsearchConfig', function($log, $httpBackend, npRsearchConfig){

            var config = npRsearchConfig.resource || {};

            // search
            function buildSearchResponse(method, url, data, headers) {
                $log.log('buildSearchResponse...', method, url, data, headers);

                var data = {
                    'xxx': 'yyy'
                };
                return [200, data];
            }

            //
            return {
                mockHttp: function(){
                    // search
                    $httpBackend.when('GET', config.searchUrl)
                        .respond(buildSearchResponse);
                        //.passThrough();
                }
            };
        }]);
    //
});
