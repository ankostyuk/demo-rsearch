/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var angular         = require('angular'),
        purl            = require('purl');

    return angular.module('app.log', [])
        //
        .run(['$log', '$rootScope', '$timeout', 'npUser', 'appLog', function($log, $rootScope, $timeout, npUser, appLog){
            //
            var user = npUser.user();

            $rootScope.$on('app-user-apply', function(e, change){
                if (!change.first) {
                    return;
                }

                var d = {};

                d[user.isAuthenticated() ? 'authenticated' : 'anonymous'] = {};

                appLog.log('open', d, true);
            });

            //
            var searchLogDelay = 2000, // 2 секунды
                searchLogPromise;

            $rootScope.$on('np-rsearch-navigation-search-result', function(e, query, result){
                $timeout.cancel(searchLogPromise);

                searchLogPromise = $timeout(function(){
                    var d = {
                        q: query,
                        totalResult: result.total
                    };

                    d[result.total ? 'effective' : 'empty'] = {};

                    appLog.log('search', d, true);
                }, searchLogDelay);
            });

            //
            $rootScope.$on('np-rsearch-navigation-node-form', function(e, node){
                appLog.log('open_mini_report', {
                    nodeId: buildNodeId(node),
                    nodeType: node._type
                }, true);
            });

            //
            $rootScope.$on('np-rsearch-navigation-node-relations', function(e, node, relationType){
                appLog.log('open_related', {
                    nodeId: buildNodeId(node),
                    nodeType: node._type,
                    relationType: relationType
                }, true);
            });

            //
            function buildNodeId(node) {
                return node._type + '.' + node._id;
            }
        }])
        //
        .factory('appLog', ['$log', 'npUser', 'appConfig', function($log, npUser, appConfig){
            var url     = purl(),
                urlPath = url.attr('path'),
                user    = npUser.user();

            //
            function logToYandexMetrika(logObj) {
                var yaCounter = window[appConfig.yandexMetrikaCounterName];

                if (!yaCounter) {
                    return;
                }

                yaCounter.hit(urlPath, null, null, logObj);
            }

            return {
                log: function(action, params, withUserInfo) {
                    var logData = {},
                        logObj  = {};

                    logData[action] = params || {};

                    if (withUserInfo) {
                        logData['userId'] = user.getId() || 'anonymous';
                    }

                    logObj[appConfig.name] = logData;

                    logToYandexMetrika(logObj);
                }
            };
        }]);
    //
});
