//
define(function(require) {'use strict';
                  require('css!./bower-components/bootstrap/css/bootstrap');
                  require('css!./style');

    var angular = require('angular');

                  require('angular-locale_ru'); // TODO i18n/l10n

                  require('rsearch');

                  require('./app-data');

    var app = angular.module('app', ['np.rsearch', 'app.data'])
        //
        .constant('npRsearchConfig', {
            resource: {
                searchUrl: '/rsearch-api/search'
            }
        })
        //
        .config(function($provide) {
            $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
        })
        //
        .run(['$log', '$rootScope', '$window', 'dataMock', function($log, $rootScope, $window, dataMock){
            $log.log('app...');

            dataMock.mockHttp();
        }]);

    angular.bootstrap(document, [app.name]);
});
