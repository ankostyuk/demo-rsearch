/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    //                       require('less!./styles/style');
    //
    // var template        = require('text!./views/view.html');

                          require('jquery');
                          require('lodash');

    var i18n            = require('i18n'),
        angular         = require('angular');

    var extmodules = {
        'np.directives':  require('np.directives')
    };

    var submodules = {
        'resource':       require('./resource')
    };

    //
    return angular.module('np.extraneous-purchase-dishonest-supplier-company', _.pluck(extmodules, 'name').concat(_.pluck(submodules, 'name')))
        //
        .run([function(){
            // template = i18n.translateTemplate(template);
        }])
        //
        .factory('npExtraneousPurchaseDishonestSupplierCompanyHelper', ['$log', '$timeout', 'npExtraneousPurchaseDishonestSupplierCompanyResource', function($log, $timeout, npExtraneousPurchaseDishonestSupplierCompanyResource){

            function getRecCount(search, success, error, complete) {
                if (_.isEmpty(search)) {
                    $log.warn('getRecCount... error: search is blank');
                    errorCallback();
                    return null;
                }

                var request = npExtraneousPurchaseDishonestSupplierCompanyResource.recSearch({
                    search: search,
                    success: function(data, status){
                        var result = getResultTotal(data);

                        if (!_.isNumber(result)) {
                            errorCallback();
                            return;
                        }

                        if (_.isFunction(success)) {
                            success(result);
                        }
                    },
                    error: errorCallback
                });

                function errorCallback() {
                    if (_.isFunction(error)) {
                        error();
                    }
                }

                return request;
            }

            function getResultTotal(result) {
                var r = result && result['total'];

                if (!_.isNumber(r)) {
                    r = null;
                }

                return r;
            }

            // API
            return {
                getResultTotal: getResultTotal,
                getRecCount: getRecCount
            };
        }]);
    //
});
