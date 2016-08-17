/**
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    //
    var angular         = require('angular'),
        testData        = require('./test-data');

    var angularModules = [
        require('./test-utils'),
        require('./relation-history/relation-history')
    ];

    //
    return angular.module('relation-history-test', _.pluck(angularModules, 'name'))
        .factory('relationHistoryTest', ['$log', 'testUtils', 'npRelationHistory', function($log, testUtils, npRelationHistory){

            //
            function buildActuality_COMPANY_1641441_Test() {
                $log.info('ООО "ИНТ Проекты" buildActuality test...');

                var node = testData.nodes['COMPANY.1641441'];

                testUtils.toTypeId(node);
                // node._relations = testData.relations.nodes['COMPANY.1641441.relations'];
                node._relations = testData.relations.nodes['COMPANY.1641441.relations-2'];

                npRelationHistory.buildActuality(node);
                testUtils.relationsDump(node);
            }

            //
            function buildActuality_COMPANY_8505253_Test() {
                $log.info('ООО "СТРОЙКОНТРОЛЬСЕРВИС" buildActuality test...');

                var node = testData.nodes['COMPANY.8505253'];

                testUtils.toTypeId(node);
                // node._relations = testData.relations.nodes['COMPANY.8505253.relations'];
                node._relations = testData.relations.nodes['COMPANY.8505253.relations-2'];

                npRelationHistory.buildActuality(node);
                testUtils.relationsDump(node);
            }

            return {
                test: function() {
                    $log.info('Run relationHistory tests...');

                    buildActuality_COMPANY_1641441_Test();
                    buildActuality_COMPANY_8505253_Test();
                }
            };
        }]);
    //
});
