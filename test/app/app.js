//
define(function(require) {'use strict';
    var root = window;

    //
                            require('jquery');
                            require('lodash');

    var angular           = require('angular'),
        uuid              = require('uuid'),
        l10n              = require('np.l10n');

                            // require('nkb.icons');
                            // require('css!../external_components/bootstrap/css/bootstrap');
                            // require('less!./styles/app');

                            require('moment');
                            require('moment-timezone');

    var angularModules = [
        require('angular-moment'),
        require('np.l10n/np.l10n'),
        require('test')
    ];

    var app = angular.module('app', _.pluck(angularModules, 'name'))
        //
        .constant('appConfig', {
            name: 'rsearch',
            // uuid: uuid.v4(),
            // meta: root._APP_CONFIG.meta,
            // yandexMetrikaCounterName: 'yaCounter23296318',
            resource: {
                'meta.url':                 '/nkbrelation/api/meta',
                'search.url':               '/nkbrelation/api/nodes',
                'relations.url':            '/nkbrelation/api/node',
                'algo.url':                 '/nkbrelation/api/algo',
                'egrul.history.url':        '/siteapp/api/egrul/history',
                'nkb.file.download.url':    '/reports/file.php',

                // connections
                'list.create.url':          '/connections/api/list',
                'lists.url':                '/connections/api/lists',

                'list.entry.create.url':    '/connections/api/list/{{listId}}/entry',

                'nodes.lists.url':          '/connections/api/nodes/lists'
            },
            product: {
            }
        })
        //
        .constant('nkbUserConfig', {
            resource: {
                'external.url': '/siteapp/url/external/',
                'users.url':    '/siteapp/api/users',
                'login.url':    '/siteapp/login',
                'logout.url':   '/siteapp/logout'
            }
        })
        //
        // .constant('nkbCommentConfig', {
        //     resource: {
        //         'api.url': '/nkbcomment/api'
        //     }
        // })
        // //
        // .constant('npRsearchAutokadConfig', {
        //     gettingCaseCount: false
        // })
        // //
        // .constant('npRsearchFedresursBankruptcyConfig', {
        //     gettingMessageCount: false
        // })
        // //
        // .constant('npRsearchFnsRegDocsConfig', {
        //     gettingDocCount: true
        // })
        // //
        // .constant('npRsearchPurchaseDishonestSupplierConfig', {
        //     gettingRecCount: true
        // })
        //
        .constant('angularMomentConfig', {
            timezone: 'Europe/Moscow'
        })
        //
        .config(['$logProvider', function($logProvider){
            $logProvider.debugEnabled(true);
        }])
        //
        .run(['$log', '$rootScope', 'npL10n', function($log, $rootScope, npL10n){
            //
        }]);
    //

    return {
        init: function(parent) {
            $(function() {
                l10n.initPromise.done(function(){
                    angular.bootstrap(parent, [app.name]);
                });
            });
        }
    };
});
