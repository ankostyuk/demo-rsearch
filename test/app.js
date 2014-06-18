//
define(function(require) {'use strict';
    var root = window;

    //
    require('css!./bower-components/bootstrap/css/bootstrap');
    require('css!./style');

    //
    var angular = require('angular');
                  require('l10n');
                  require('./app-data');

    //
    require('rsearch');

    //
    var mock = false;

    var app = angular.module('app', ['np.rsearch', 'app.data'])
        //
        .constant('npRsearchConfig', {
            resource: {
                searchUrl: '/rsearch-api/search'
            }
        })
        //
        .config(function($provide) {
            if (mock) {
                $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
            }
        })
        //
        .run(['$log', '$rootScope', '$window', 'dataMock', function($log, $rootScope, $window, dataMock){
            $log.log('app...');

            if (mock) {
                dataMock.mockHttp();
            }
        }]);

    angular.bootstrap(document, [app.name]);
});
