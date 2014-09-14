//
define(function(require) {'use strict';
    var root = window;

    //
                  require('jquery');
                  require('underscore');

    var angular = require('angular'),
        uuid    = require('uuid');

                  require('icons');
                  require('css!../external_components/bootstrap/css/bootstrap');
                  require('less!./styles/app');

    var submodules = {
        login:          require('app.login'),
        lang:           require('app.lang'),
        l10n:           require('l10n'),
        nkbcomment:     require('nkbcomment'),
        rsearch:        require('rsearch')
    };

    var app = angular.module('app', _.pluck(submodules, 'name'))
        //
        .constant('appConfig', {
            uuid: uuid.v4(),
            meta: root._APP_CONFIG.meta,
            resource: {
                'users.url':                '/siteapp/api/users',
                'login.url':                '/siteapp/login',
                'logout.url':               '/siteapp/logout',
                'meta.url':                 '/nkbrelation/api/meta',
                'search.url':               '/nkbrelation/api/nodes',
                'relations.url':            '/nkbrelation/api/node',
                'egrul.history.url':        '/siteapp/api/egrul/history',
                'nkb.file.download.url':    '/reports/file.php',
                'nkbcomment.api.url':       '/nkbcomment/api'
            },
            product: {
                'market_profile_short': {
                    'info.url': '/products/companies/профили-компаний/',
                    'purchase.url': 'http://testing.nkb/reports/?code=rep_market_profile_short&fromSearch=1&id={{node.bsn_id}}'
                },
                'market_list': {
                    'info.url': '/products/companies/профили-компаний/',
                    'purchase.url': 'http://testing.nkb/reports/?code=rep_market_list&fromSearch=1&id={{node.bsn_id}}'
                },
                'business_profile': {
                    'info.url': '/products/companies/профили-компаний/',
                    'purchase.url': 'http://testing.nkb/reports/?code=rep_business_profile&fromSearch=1&id={{node.bsn_id}}'
                },
                'market_profile_full': {
                    'info.url': '/products/companies/профили-компаний/',
                    'purchase.url': 'http://testing.nkb/reports/?code=rep_market_profile_full&fromSearch=1&id={{node.bsn_id}}'
                },
                'credit_profile': {
                    'info.url': '/products/companies/профили-компаний/',
                    'purchase.url': 'http://testing.nkb/reports/?code=rep_credit_profile&fromSearch=1&id={{node.bsn_id}}'
                },
                'ext_history_profile': {
                    'info.url': '/products/companies/профили-компаний/',
                    'purchase.url': 'http://testing.nkb/reports/?code=rep_history_profile&fromSearch=1&id={{node.bsn_id}}'
                },
                'extended_research': {
                    'info.url': '/products/companies/расширенное-исследование-компаний/',
                    'purchase.url': 'http://testing.nkb/search/offlinea/?idcomp={{node.bsn_id}}'
                },
                'egrulCompanyReport': {
                    'info.url': '/products/companies/egrul/',
                    'purchase.url': 'http://testing.nkb/search/offlinee/?idcomp={{node.bsn_id}}'
                },
                'egrulFounderPersonReport': {
                    'info.url': '/products/people/',
                    'purchase.url': 'http://testing.nkb/search/offlinee/'
                },
                'egrulFounderCompanyReport': {
                    'info.url': '/products/people/',
                    'purchase.url': 'http://testing.nkb/search/offlinee/'
                },
                'egripReport': {
                    'info.url': '/products/people/',
                    'purchase.url': 'http://testing.nkb/search/offlinep/'
                },
                'relations_xxx': {
                    'info.url': '/products/companies/схема-связанных-лиц/',
                    'purchase.url': '/relations_xxx'
                },
                'relations_find_related': {
                    'info.url': '/products/relations/',
                    'purchase.url': '/nkbrelation/report?node.type={{node._type}}&{{node.__idField}}.equals={{node[node.__idField]}}'
                }
            }
        })
        //
        .config(['$logProvider', function($logProvider){
            $logProvider.debugEnabled(false);
        }])
        //
        .run(['$log', '$q', '$rootScope', 'npRsearchMetaHelper', 'npNkbCommentHelper', function($log, $q, $rootScope, npRsearchMetaHelper, npNkbCommentHelper){
            //
            _.extend($rootScope, {
                app: {
                    ready: false
                },
                isAppReady: function() {
                    return $rootScope.app.ready;
                }
            });

            $q.all([npRsearchMetaHelper.initPromise(), npNkbCommentHelper.initPromise()]).then(function(){
                $rootScope.app.ready = true;
            });
        }]);

    angular.bootstrap(document, [app.name]);
});
