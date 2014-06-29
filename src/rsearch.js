/**
 * @module rsearch
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var template        = require('text!./views/rsearch.html');

                          require('jquery');
                          require('underscore');
    var i18n            = require('i18n'),
        angular         = require('angular');

    var submodules = {
        rsearchInput:       require('./rsearch-input'),
        rsearchNavigation:  require('./rsearch-navigation'),
        rsearchViews:       require('./rsearch-views'),
        rsearchResource:    require('./rsearch-resource'),
        rsearchMeta:        require('./rsearch-meta')
    };

    return angular.module('np.rsearch', _.pluck(submodules, 'name'))
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('npRsearch', ['$log', function($log){
            return {
                restrict: 'A',
                template: template,
                scope: {},
                controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                    //
                    var scope   = $scope,
                        element = $element,
                        attrs   = $attrs;
                }]
            };
        }]);
    //
});
