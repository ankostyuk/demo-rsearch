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

                  require('rsearch');

    var app = angular.module('app', ['np.rsearch'])
        //
        .constant('npRsearchConfig', {
            resource: {
                searchUrl: '/nkbrelation/api/nodes',
                relationsUrl: '/nkbrelation/api/node'
            }
        })
        //
        .config(function($logProvider){
            $logProvider.debugEnabled(false);
        })
        //
        .run(['$log', '$timeout', '$rootScope', '$window', '$document', function($log, $timeout, $rootScope, $window, $document){
            $log.log('app...');

            //
            $rootScope.$on('np-rsearch-input-ready', function(e, element){
                element.find('input')[0].focus();

                // test
                $timeout(function(){
                    $rootScope.$emit('np-rsearch-input-refresh', '1');
                });
            });
        }]);

    angular.bootstrap(document, [app.name]);
});
