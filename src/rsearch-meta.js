/**
 * @module rsearch-meta
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

    var angular = require('angular');

    return angular.module('np.rsearch-meta', [])
        //
        .constant('npRsearchMeta', {
            nodes: {
                types: ['COMPANY', 'INDIVIDUAL', 'ADDRESS', 'PHONE']
            }
        })
        //
        .factory('npRsearchMetaHelper', ['$log', 'npRsearchMeta', function($log, npRsearchMeta){

            return {
                getNodeTypes: function(options) {
                    return npRsearchMeta.nodes.types;
                }
            };
        }]);
    //
});
