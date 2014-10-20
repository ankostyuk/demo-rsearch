/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var angular         = require('angular');

    return angular.module('app.log', [])
        //
        .run(['$log', '$rootScope', 'appLog', function($log, $rootScope, appLog){
            //
            $rootScope.$on('app-user-apply', function(e, change){
                if (!change.first) {
                    return;
                }

                appLog.log('user', null, true);
            });
        }])
        //
        .factory('appLog', ['$log', 'npUser', 'appConfig', function($log, npUser, appConfig){
            var user = npUser.user();

            //
            function logToYandexMetrika(action, params) {
                var yaCounter = window[appConfig.yandexMetrikaCounterName];

                $log.info('logToYandexMetrika...', yaCounter);

                if (!yaCounter) {
                    return;
                }

                var yaParams = {};

                yaParams[action] = params;

                console.info('yaCounter params...', yaParams);

                yaCounter.params(yaParams);
            }

            return {
                log: function(action, params, withUserInfo) {
                    params = params || {};

                    if (withUserInfo) {
                        params['userId'] = user.getId() || 'anonymous';
                    }

                    $log.info('appLog...', action, params);

                    logToYandexMetrika(action, params);
                }
            };
        }]);
    //
});
