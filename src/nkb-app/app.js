//
define(function(require) {'use strict';
    var root = window;

    //
                            require('jquery');
                            require('lodash');

    var angular           = require('angular'),
        uuid              = require('uuid'),
        l10n              = require('np.l10n');

                            require('nkb.icons');
                            require('css!../external_components/bootstrap/css/bootstrap');
                            require('less!./styles/app');

                            require('moment');
                            require('moment-timezone');

    var angularModules = {
        'angular-moment':   require('angular-moment'),

        'np.l10n':          require('np.l10n/np.l10n'),
        login:              require('app.login'),
        lang:               require('app.lang'),
        log:                require('app.log'),
        nkbcomment:         require('nkb.comment'),
        rsearch:            require('rsearch')
    };

    var app = angular.module('app', _.pluck(angularModules, 'name'))
        //
        .constant('appConfig', {
            name: 'rsearch',
            uuid: uuid.v4(),
            meta: root._APP_CONFIG.meta,
            yandexMetrikaCounterName: 'yaCounter23296318',
            resource: {
                'meta.url':                 '/nkbrelation/api/meta',
                'search.url':               '/nkbrelation/api/nodes',
                'relations.url':            '/nkbrelation/api/node',
                'algo.url':                 '/nkbrelation/api/algo',
                'egrul.history.url':        '/siteapp/api/egrul/history',
                'nkb.file.download.url':    '/reports/file.php'
            },
            product: {
                'market_profile_short': {
                    'info.url': '/examples/marketing_profile/',
                    'purchase.url': '/reports/?code=rep_market_profile_short&fromSearch=1&id={{node.bsn_id}}&lang={{lang}}'
                },
                'market_list': {
                    'info.url': '/examples/direct_mail/',
                    'purchase.url': '/reports/?code=rep_market_list&fromSearch=1&id={{node.bsn_id}}&lang={{lang}}'
                },
                'business_profile': {
                    'info.url': '/examples/business_profile/',
                    'purchase.url': '/reports/?code=rep_business_profile&fromSearch=1&id={{node.bsn_id}}&lang={{lang}}'
                },
                'market_profile_full': {
                    'info.url': '/examples/analitic_profile/',
                    'purchase.url': '/reports/?code=rep_market_profile_full&fromSearch=1&id={{node.bsn_id}}&lang={{lang}}'
                },
                'credit_profile': {
                    'info.url': '/examples/credit_profile/',
                    'purchase.url': '/reports/?code=rep_credit_profile&fromSearch=1&id={{node.bsn_id}}&lang={{lang}}'
                },
                'ext_history_profile': {
                    'info.url': '/examples/history_profile/',
                    'purchase.url': '/reports/?code=rep_history_profile&fromSearch=1&id={{node.bsn_id}}&lang={{lang}}'
                },
                'extended_research': {
                    'info.url': '/examples/extended/',
                    'purchase.url': '/search/offlinea/?form[comp_name]={{node.name}}&idcomp={{node.bsn_id}}'
                },
                'egrulCompanyReport': {
                    'info.url': '/egryl/',
                    'purchase.url': '/search/offlinee/?idcomp={{node.bsn_id}}'
                },
                'egrulChiefReport': {
                    'info.url': '/egryl/',
                    'purchase.url': '/search/offlinee/?form[chief_name]={{node.name}}&form[use_chief]=1'
                },
                'egrulFounderPersonReport': {
                    'info.url': '/egryl/',
                    'purchase.url': '/search/offlinee/?form[founder_person]={{node.name}}&form[use_founder_person]=1'
                },
                'egripReport': {
                    'info.url': '/egryl/',
                    'purchase.url': '/search/offlinep/?form[comp_name]={{node.name}}'
                },
                'actualizeReport': {
                    'info.url': '/examples/quartal_profile/',
                    'purchase.url': '/search/offlinea/?form[comp_name]={{node.name}}&idcomp={{node.bsn_id}}'
                },
                'relations_find_related': {
                    'info.url': '/search/relations/',
                    'purchase.url': '/nkbrelation/report?node.type={{node._type}}&{{node.__idField}}.equals={{node[node.__idField]}}&relation.type={{relationType}}&relation.direction={{relationDirection}}'
                },
                'ForeignCompanyReport': {
                    'info.url': '/dnb/profile/',
                    'purchase.url': '/search/offlined/'
                }
            }
        })
        //
        .constant('nkbUserConfig', {
            resource: {
                'users.url':    '/siteapp/api/users',
                'login.url':    '/siteapp/login',
                'logout.url':   '/siteapp/logout'
            }
        })
        //
        .constant('nkbCommentConfig', {
            resource: {
                'api.url': '/nkbcomment/api'
            }
        })
        //
        .constant('npRsearchAutokadConfig', {
            gettingCaseCount: false
        })
        //
        .constant('npRsearchFedresursBankruptcyConfig', {
            gettingMessageCount: false
        })
        //
        .constant('npRsearchFnsRegDocsConfig', {
            gettingDocCount: true
        })
        //
        .constant('angularMomentConfig', {
            timezone: 'Europe/Moscow'
        })
        //
        .config(['$logProvider', function($logProvider){
            $logProvider.debugEnabled(false);
        }])
        //
        .run(['$log', '$rootScope', 'npL10n', function($log, $rootScope, npL10n){
            //
            _.extend($rootScope, {
                app: {
                    isSearch: null,
                    ready: false,
                    reset: function() {
                        $rootScope.$emit('np-rsearch-input-set-text', '', null);
                    }
                },
                isAppReady: function() {
                    return $rootScope.app.ready;
                }
            });

            //
            $rootScope.$on('np-rsearch-navigation-init', function(e, scope){
                _.extend($rootScope.app, {
                    isSearch: scope.isSearch,
                    ready: true
                });
            });
        }])
        //
        .directive('appProvideSupport', ['$rootScope', '$timeout', 'nkbUser', function($rootScope, $timeout, nkbUser) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    $rootScope.$on('nkb-user-apply', function() {
                        var src = '//image.providesupport.com/js/nkb-trial/safe-standard.js?ps_h=Xase&ps_t=' + new Date().getTime();
                        var user = nkbUser.user();
                        if (user.isAuthenticated()) {
                            src += '&Client%20Login=' + user.getLogin();
                                    //'&Client%20Details=' +
                                    //'http%3A//www.creditnet.ru/admin/clients/details/%3Fid%3D' + user.getId();
                        }

                        element.html('<div id="scXase" style="display:inline"></div>');

                        $timeout(function() {
                            // Загружаем скрипт без параметра '_'
                            $.ajax({
                                url: src,
                                dataType: 'script',
                                cache: true
                            });
                        });
                    });
                }
            };
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
