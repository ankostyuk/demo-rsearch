/**
 * @module data-mocks
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular'),
        moment          = require('moment');

                          require('angular-mocks');

    var testData        = require('./test-data');

    var purl                = require('purl'),
        locationSearch      = purl().param(),
        requestDelay        = parseInt(locationSearch['test-request-delay']) || 0;

    //
    function getRequestDelay(url) {
        return requestDelay;
    }

    function getUrlParam(url, after) {
        var params  = url.split('/'),
            param   = null;

        _.each(url.split('/'), function(p, i){
            if (p === after) {
                param = params[i + 1];
                return false;
            }
        });

        return param;
    }

    //
    return angular.module('data-mocks', ['ngMockE2E'])
        //
        .config(function($provide) {
            // delay mock backend responses
            // https://github.com/bahmutov/infinite-fake-data#slowing-down-mock-respones
            $provide.decorator('$httpBackend', function($delegate) {
                var proxy = function(method, url, data, callback, headers) {
                    var interceptor = function() {
                        var _this       = this,
                            _arguments  = arguments;

                        setTimeout(function() {
                            // return result to the client AFTER delay
                            callback.apply(_this, _arguments);
                        }, getRequestDelay(url));
                    };

                    return $delegate.call(this, method, url, data, interceptor, headers);
                };

                for (var key in $delegate) {
                    proxy[key] = $delegate[key];
                }

                return proxy;
            });
        })
        //
        .run(['$log', '$httpBackend', '$timeout', function($log, $httpBackend, $timeout){
            // user
            $httpBackend.whenGET(/^\/siteapp\//).passThrough();
            $httpBackend.whenPOST(/^\/siteapp\//).passThrough();

            // connections
            $httpBackend.whenGET(/^\/connections\//).passThrough();
            $httpBackend.whenPOST(/^\/connections\//).passThrough();

            // autokad
            $httpBackend.whenPOST(/^\/kad.arbitr.ru\//).passThrough();

            // extraneous
            $httpBackend.whenGET(/^\/extraneous\//).passThrough();

            // nkbrelation
            $httpBackend.whenGET(/^\/nkbrelation\/api\/(meta|node|algo)\//).passThrough();

            // nkbrelation/api/nodes
            $httpBackend.whenGET(/^\/nkbrelation\/api\/nodes\/(COMPANY|INDIVIDUAL|ADDRESS|PHONE)/).passThrough();

            // nkbrelation/api/nodes/SELFEMPLOYED
            $httpBackend.whenGET(/^\/nkbrelation\/api\/nodes\/SELFEMPLOYED/).respond(function(method, url){
                $log.info(method, url);
                return [200, testData.search['SELFEMPLOYED-2']];
            });
        }]);
    //
});
