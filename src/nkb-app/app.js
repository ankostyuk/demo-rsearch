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
                    'info.url': '/examples/marketing_profile/',
                    'purchase.url': '/reports/?code=rep_market_profile_short&fromSearch=1&id={{node.bsn_id}}'
                },
                'market_list': {
                    'info.url': '/examples/direct_mail/',
                    'purchase.url': '/reports/?code=rep_market_list&fromSearch=1&id={{node.bsn_id}}'
                },
                'business_profile': {
                    'info.url': '/examples/business_profile/',
                    'purchase.url': '/reports/?code=rep_business_profile&fromSearch=1&id={{node.bsn_id}}'
                },
                'market_profile_full': {
                    'info.url': '/examples/analitic_profile/',
                    'purchase.url': '/reports/?code=rep_market_profile_full&fromSearch=1&id={{node.bsn_id}}'
                },
                'credit_profile': {
                    'info.url': '/examples/credit_profile/',
                    'purchase.url': '/reports/?code=rep_credit_profile&fromSearch=1&id={{node.bsn_id}}'
                },
                'ext_history_profile': {
                    'info.url': '/examples/history_profile/',
                    'purchase.url': '/reports/?code=rep_history_profile&fromSearch=1&id={{node.bsn_id}}'
                },
                'extended_research': {
                    'info.url': '/examples/extended/',
                    'purchase.url': '/search/offlinea/?idcomp={{node.bsn_id}}'
                },
                'egrulCompanyReport': {
                    'info.url': '/egryl/',
                    'purchase.url': '/search/offlinee/?idcomp={{node.bsn_id}}'
                },
                'egrulFounderPersonReport': {
                    'info.url': '/egryl/',
                    'purchase.url': '/search/offlinee/'
                },
                'egrulFounderCompanyReport': {
                    'info.url': '/egryl/',
                    'purchase.url': '/search/offlinee/'
                },
                'egripReport': {
                    'info.url': '/egryl/',
                    'purchase.url': '/search/offlinep/'
                },
                'actualizeReport': {
                    'info.url': '/examples/quartal_profile/',
                    'purchase.url': '/search/offlinea/?idcomp={{node.bsn_id}}'
                },
                'relations_find_related': {
                    'info.url': '/search/relations/',
                    'purchase.url': '/nkbrelation/report?node.type={{node._type}}&{{node.__idField}}.equals={{node[node.__idField]}}'
                }
            }
        })
        //
        .config(['$logProvider', function($logProvider){
            $logProvider.debugEnabled(false);
        }])
        //
        .run(['$log', '$q', '$rootScope', '$document', 'npRsearchMetaHelper', 'npNkbCommentHelper', function($log, $q, $rootScope, $document, npRsearchMetaHelper, npNkbCommentHelper){
            //
            _.extend($rootScope, {
                app: {
                    isSearch: null,
                    ready: false
                },
                isAppReady: function() {
                    return $rootScope.app.ready;
                }
            });

            $q.all([npRsearchMetaHelper.initPromise(), npNkbCommentHelper.initPromise()]).then(function(){
                var rsearchNavigationScope = $document.find('[np-rsearch-navigation]').isolateScope();

                _.extend($rootScope.app, {
                    isSearch: rsearchNavigationScope.isSearch,
                    ready: true
                });
            });
        }]);

    angular.bootstrap(document, [app.name]);
});
