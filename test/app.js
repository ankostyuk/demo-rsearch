//
define(function(require) {'use strict';
    //
    require('css!./bower-components/bootstrap/css/bootstrap');
    require('css!./style');

    var angular = require('angular'),
        rsearch = require('rsearch');

    var app = angular.module('app', [rsearch.name])
        //
        .run(['$log', '$rootScope', '$window', function($log, $rootScope, $window){
            $log.log('app...');
        }]);

    angular.bootstrap(document, [app.name]);
});
