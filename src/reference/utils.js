/**
 * @module nkb.reference.utils
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular');

    var submodules = [
        require('./sub-federal-unit')
    ];

    //
    return angular.module('nkb.reference.utils', _.pluck(submodules, 'name'))
        //
        .factory('nkbReferenceUtils', ['$log', 'nkbReferenceRegionCode', function($log, nkbReferenceRegionCode){

            function getLocalityByAddress(address, unitCode) {
                if (nkbReferenceRegionCode.isFederalCity(unitCode)) {
                    return null;
                }

                address = _.trim(address);

                if (_.isBlank(address)) {
                    return null;
                }

                if (_.startsWith(address, ',')) {
                    return v1();
                } else {
                    return v2();
                }


                // v1:
                //
                // ,625009, ,                       , ТЮМЕНЬ Г,             , ТОВАРНОЕ ШОССЕ УЛ, Д 15,,
                // ,352500, КРАСНОДАРСКИЙ КРАЙ,     , ЛАБИНСК Г,            , КРАСНАЯ УЛ, Д 67, КОРП 1,
                // ,141407, МОСКОВСКАЯ ОБЛ,         ,ХИМКИ Г,               ,ЮБИЛЕЙНЫЙ ПР-КТ,61,,
                // ,368300, ДАГЕСТАН РЕСП,          , КАСПИЙСК Г,           , НАЗАРОВА УЛ,1,А,
                // ,432071, ,                       , УЛЬЯНОВСК Г,          , ГОНЧАРОВА УЛ, Д 19,,
                function v1() {
                    var ts          = address.split(/\s?,\s?/),
                        locality    = ts[4];

                    return normalizeLocality(locality);
                }

                // v2:
                //
                // 450076, РЕСПУБЛИКА БАШКОРТОСТАН,     Г.УФА,              УЛ КРАСИНА,     Д.52
                // 355003, СТАВРОПОЛЬ Г.,               ЛЕНИНА УЛ.,         293,            ЛИТЕР,А,1
                function v2() {
                    var ts          = address.split(/\s?,\s?/),
                        regionData  = nkbReferenceRegionCode.getDataByUnitCode(unitCode),
                        i, locality;

                    if ((new RegExp(ts[1], 'i')).test(regionData.name)) {
                        locality = ts[2];
                    } else {
                        locality = ts[1];
                    }

                    return normalizeLocality(locality);
                }

                function normalizeLocality(locality) {
                    locality = _.trim(locality);

                    if (_.isBlank(locality)) {
                        return null;
                    }

                    locality = locality.replace('.', ' ').replace(/^\s*(ГОРОД|ГОР|Г|ПОСЕЛОК|ПОСЁЛОК|ПОС|П|ДЕРЕВНЯ|ДЕР|Д|СЕЛО|СЕЛ|С)\s+|\s+(ГОРОД|ГОР|Г|ПОСЕЛОК|ПОСЁЛОК|ПОС|П|ДЕРЕВНЯ|ДЕР|Д|СЕЛО|СЕЛ|С)\s*$/i, '');
                    locality = _.capitalize(locality.toLowerCase());

                    return locality;
                }

                return null;
            }

            //
            return {
                getLocalityByAddress: getLocalityByAddress,

                getRegionUnitCodeByORGNIP: function(orgnip) {
                    return orgnip ? orgnip.substr(3, 2) : null;
                }
            };
        }]);
    //
});
