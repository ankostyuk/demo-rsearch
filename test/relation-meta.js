/**
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    //
    var angular         = require('angular'),
        testData        = require('./test-data');

    //
    return angular.module('relation-meta', [])
        //
        .factory('relationMeta', ['$log', function($log){
            //
            var relationMetaExtra = {
                //
                nodeTypes: {},
                //
                relationTypes: {}
            };

            //
            var nodeTypes = {};
            _.each(testData.meta.nodeTypes, function(nodeType){
                nodeTypes[nodeType.name] = nodeType;
            });
            _.defaultsDeep(nodeTypes, relationMetaExtra.nodeTypes);
            $log.info('nodeTypes:', _.keys(nodeTypes));

            //
            var relationTypes = {};
            _.each(testData.meta.relationTypes, function(relationType){
                relationTypes[relationType.name] = relationType;
            });
            _.defaultsDeep(relationTypes, relationMetaExtra.relationTypes);
            $log.info('relationTypes:', _.keys(relationTypes));

            //
            return {
                nodeTypes: nodeTypes,
                relationTypes: relationTypes
            };
        }]);
    //
});
