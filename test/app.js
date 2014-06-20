//
define(function(require) {'use strict';
    var root = window;

    //
    require('css!./bower-components/bootstrap/css/bootstrap');
    require('less!./style');

    //
                  require('jquery');

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
                searchUrl: '/nkbrelation/api/nodes'
            }
        })
        //
        .config(function($provide) {
            if (mock) {
                $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
            }
        })
        //
        .run(['$log', '$rootScope', '$window', '$document', 'dataMock', function($log, $rootScope, $window, $document, dataMock){
            $log.log('app...');

            if (mock) {
                dataMock.mockHttp();
            }

            //
            $rootScope.$on('np.rsearch-input.ready', function(e, element){
                element.find('input')[0].focus();
            });
        }]);

    angular.bootstrap(document, [app.name]);
});
