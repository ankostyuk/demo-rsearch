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
                types: {
                    'COMPANY': {
                        searchResultPriority: 5
                    },
                    'INDIVIDUAL': {
                        searchResultPriority: 4
                    },
                    'ADDRESS': {
                        searchResultPriority: 2
                    },
                    'PHONE': {
                        searchResultPriority: 1
                    }
                }
            }
        })
        //
        .factory('npRsearchMetaHelper', ['$log', 'npRsearchMeta', function($log, npRsearchMeta){

            return {
                getNodeTypes: function() {
                    return npRsearchMeta.nodes.types;
                }
            };
        }]);
    //
});
