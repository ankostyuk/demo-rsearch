/**
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    //
    var angular         = require('angular');

    //
    var testData = {
        nodes: {
            'COMPANY.1641441': angular.fromJson(require('text!./data/nodes/COMPANY.1641441.json')),
            'COMPANY.8443194': angular.fromJson(require('text!./data/nodes/COMPANY.8443194.json')),
            'COMPANY.8505253': angular.fromJson(require('text!./data/nodes/COMPANY.8505253.json')),
            'COMPANY.8708612': angular.fromJson(require('text!./data/nodes/COMPANY.8708612.json')),

            'INDIVIDUAL.ab54ffed94bed4c9d52f96bb3b44e78eb8959013': angular.fromJson(require('text!./data/nodes/INDIVIDUAL.ab54ffed94bed4c9d52f96bb3b44e78eb8959013.json'))
        },
        relations: {
            nodes: {
                'COMPANY.1641441.relations':    angular.fromJson(require('text!./data/relations/nodes/COMPANY.1641441.relations.json')),
                'COMPANY.1641441.relations-2':  angular.fromJson(require('text!./data/relations/nodes/COMPANY.1641441.relations-2.json')),

                'COMPANY.8505253.relations':    angular.fromJson(require('text!./data/relations/nodes/COMPANY.8505253.relations.json')),
                'COMPANY.8505253.relations-2':  angular.fromJson(require('text!./data/relations/nodes/COMPANY.8505253.relations-2.json')),
            }
        },
        meta: {
            nodeTypes:      angular.fromJson(require('text!./data/meta/node-types.json')),
            relationTypes:  angular.fromJson(require('text!./data/meta/relation-types.json'))
        }
    };

    console.info('testData:', testData);

    //
    return testData;
});
