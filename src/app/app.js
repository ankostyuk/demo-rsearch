//
define(function(require) {'use strict';
    var root = window;

    //
                  require('jquery');

    var angular = require('angular');

                  require('icons');
                  require('l10n');

                  require('rsearch');

    var app = angular.module('app', ['np.rsearch'])
        //
        .constant('npRsearchConfig', {
            meta: root._APP_CONFIG.meta,
            resource: {
                'meta.url':                 '/nkbrelation/api/meta',
                'search.url':               '/nkbrelation/api/nodes',
                'relations.url':            '/nkbrelation/api/node'
            }
        })
        //
        .config(['$logProvider', function($logProvider){
            $logProvider.debugEnabled(false);
        }])
        //
        .run(['$log', function($log){
            //
        }]);

    angular.bootstrap(document, [app.name]);
});
