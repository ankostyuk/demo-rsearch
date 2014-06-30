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
                        searchResultPriority: 4
                    },
                    'INDIVIDUAL': {
                        searchResultPriority: 3
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
        .filter('OKVED', [function(){
            return function(node){
                if (!node) {
                    return null;
                }

                var okved = node['okvedcode_bal'] || node['okvedcode_main'];

                if (!okved) {
                    return null;
                }

                var okvedCode = _.chop(okved, 2).join('.');
                var okvedText = node['okved_bal_text'] || node['okved_main_text'];

                return okvedCode + ' ' + okvedText;
            };
        }])
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
