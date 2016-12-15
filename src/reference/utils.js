/**
 * @module nkb.reference.utils
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular');

    //
    return angular.module('nkb.reference.utils', [])
        //
        .factory('nkbReferenceUtils', ['$log', function($log){

            function getDataByUnitCode(unitCode) {
                return BY_UNIT_CODE_MAP[unitCode][0];
            }

            //
            return {
                getRegionUnitCodeByORGNIP: function(orgnip) {
                    return orgnip ? orgnip.substr(3, 2) : null;
                }
            };
        }]);
    //
});
