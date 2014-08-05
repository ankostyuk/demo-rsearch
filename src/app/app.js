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
                'users.url':                '/siteapp/api/users',
                'meta.url':                 '/nkbrelation/api/meta',
                'search.url':               '/nkbrelation/api/nodes',
                'relations.url':            '/nkbrelation/api/node',
                'egrul.list.url':           '/search/ajax/egrul.php',
                'nkb.file.download.url':    '/reports/file.php'
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
                'egrulChiefReport': {
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
        .run(['$log', function($log){
            //
        }]);

    angular.bootstrap(document, [app.name]);
});
