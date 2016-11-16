/**
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    //
    var angular         = require('angular'),
        moment          = require('moment'),
        testData        = require('./test-data');

    var angularModules = [
        require('./relation-meta')
    ];

    var MEDIUM_DATE_FORMAT = 'DD.MM.YYYY';

    //
    return angular.module('test-utils', _.pluck(angularModules, 'name'))
        .factory('testUtils', ['$log', 'relationMeta', function($log, relationMeta){

            var relationUtils = {
                nodeTypes: {
                    'COMPANY': {
                        nodeText: function(node) {
                            return node.nameshortsort + ' ОКПО ' + node.okpo + ', id: ' + node._id;
                        }
                    },
                    'INDIVIDUAL': {
                        nodeText: function(node) {
                            return node.name + ', id: ' + node._id;
                        }
                    }
                },
                relationTypes: {
                    'FOUNDER_COMPANY': {
                        relationText: founderText
                    },
                    'FOUNDER_INDIVIDUAL': {
                        relationText: founderText
                    },
                    'EXECUTIVE_INDIVIDUAL': {
                        relationText: executiveText
                    }
                }
            };

            function simpleNodeText(node) {
                return 'id: ' + node._id;
            }

            function simpleRelationText(relation) {
                return ''
                    + outdatedText(relation)
                    + sourceText(relation);
            }

            function founderText(relation) {
                return ''
                    + outdatedText(relation)
                    + (relation.sharePercent ? relation.sharePercent + '%\t\t' : '')
                    + (relation.shareAmount ? relation.shareAmount + ' руб.\t\t' : '')
                    + innText(relation)
                    + sourceText(relation)
                    + nameText(relation);
            }

            function executiveText(relation) {
                return ''
                    + outdatedText(relation)
                    + (relation.position ? relation.position + '\t\t' : '')
                    + innText(relation)
                    + sourceText(relation)
                    + nameText(relation);
            }

            function outdatedText(relation) {
                return relation.outdated ? '∅ ' : '  ';
            }

            function innText(relation) {
                return '' + (relation.inn ? 'ИНН ' + relation.inn + '\t\t' : '');
            }

            function sourceText(relation) {
                return ''
                    + 'с ' + moment(relation._since).format(MEDIUM_DATE_FORMAT)
                    + '\t\t' + relation._source
                    + '\t\tот ' + moment(relation._actual).format(MEDIUM_DATE_FORMAT);
            }

            function nameText(relation) {
                return '\t\tname: ' + relation.name;
            }

            //
            var testUtils = {
                buildTypeId: function(nodeType, nodeId) {
                    return nodeType + '.' + nodeId;
                },

                toTypeId: function(node) {
                    node._id = testUtils.buildTypeId(node._type, node._id);
                },

                relationsDump: function(node) {
                    var byRelationTypes = _.groupBy(node._relations, '_type');

                    _.each(byRelationTypes, function(relations, relationType){
                        var byDirection = {
                            'children': [],
                            'parents': []
                        };

                        _.each(relations, function(relation){
                            var direction = (relation._srcId === node._id ? 'children' : 'parents');
                            byDirection[direction].push(relation);
                        });

                        _.each(byDirection, function(relations, direction){
                            byDirection[direction] = _.groupBy(relations, direction === 'children' ? '_dstId' : '_srcId');
                        });

                        byRelationTypes[relationType] = byDirection;
                    });

                    var nodeTextFunc    = _.get(relationUtils.nodeTypes[node._type], 'nodeText') || simpleNodeText,
                        dumpText        = nodeTextFunc(node) + '\n' + 'связи...'+ '\n';

                    _.each(byRelationTypes, function(byDirection, relationType){
                        _.each(byDirection, function(byNodesId, direction){
                            if (_.isEmpty(byNodesId)) {
                                return;
                            }

                            dumpText += '\n' + '--- ' + relationType + ' ' + direction + ' ' + _.size(byNodesId) + ' ---' + '\n\n';

                            _.each(byNodesId, function(relations, nodeId){
                                relations = _.sortByOrder(relations,
                                    ['outdated', '_since', '_actual'],
                                    ['asc', 'desc', 'desc']
                                );

                                dumpText += 'id: ' + nodeId + '\n';

                                var relationsText = '';
                                _.each(relations, function(relation){
                                    var relationTextFunc = _.get(relationUtils.relationTypes[relationType], 'relationText') || simpleRelationText;
                                    relationsText += '  ' + relationTextFunc(relation) + '\n';
                                });

                                dumpText += relationsText + '\n';
                            });
                        });
                    });

                    $log.log(dumpText);
                },

                nodesRelationsDump: function(typeIds) {
                    _.each(typeIds, function(typeId){
                        var node = testData.nodes[typeId];
                        testUtils.relationsDump(node);
                    });
                }
            };

            return testUtils;
        }]);
    //
});
