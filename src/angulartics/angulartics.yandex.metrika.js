/**
 * @author ankostyuk
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.yandex.metrika
 * Enables analytics support for Yandex.Metrika (http://metrika.yandex.ru)
 */
angular.module('angulartics.yandex.metrika', ['angulartics'])
.config(['$analyticsProvider', function($analyticsProvider) {
    //
    //$analyticsProvider.registerPageTrack(function(path){
    //});

    //
    $analyticsProvider.registerEventTrack(function(action, properties){
        console.info('EventTrack...', action, properties);

        var yaCounter = window.yaCounter;

        if (!yaCounter) {
            return;
        }

        var params = {};

        params[action] = properties;

        console.info('yaCounter params...', params);

        yaCounter.params(params);
    });
}]);
})(angular);
