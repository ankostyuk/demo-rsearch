/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var template        = require('text!./views/lang.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular');

    return angular.module('app.lang', [])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('appLang', ['$log', 'npL10n', function($log, npL10n){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                link: function(scope, element, attrs) {
                    scope.l10n = npL10n.l10n();
                }
            };
        }]);
    //
});
