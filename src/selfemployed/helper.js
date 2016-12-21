/**
 * @module nkb.selfemployed.helper
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular');

    //
    return angular.module('nkb.selfemployed.helper', [])
        //
        .factory('nkbSelfemployedHelper', ['$log', 'nkbReferenceRegionCode', 'nkbReferenceUtils', function($log, nkbReferenceRegionCode, nkbReferenceUtils){

            var INFO_BLOCKS = {
                infoStatement: {},

                infoName: {},
                infoStatus: {},
                infoTermination: {},

                infoCitizenship: {
                    fix: function(info) {
                        // history
                        if (info.history) {
                            var citizenshipTypeNext = _.get(info.data, 'видГражд'),
                                citizenshipType;

                            info.history = _.filter(info.history, function(historyInfo){
                                citizenshipType = _.get(historyInfo.data, 'видГражд');
                                if (citizenshipTypeNext === citizenshipType) {
                                    return false;
                                }
                                citizenshipTypeNext = citizenshipType;
                                return true;
                            });
                        }
                    }
                },

                infoFns: {},
                infoOkved: {},
                infoLicense: {},
                infoPfr: {},
                infoFss: {},
                infoReg: {},
                infoRegOrg: {},

                infoGrnip: {
                    fix: function(info) {
                        // data
                        // TODO no reverse when resolve https://bugtrack.nkb/issues/3325
                        if (_.isArray(info.data)) {
                            // info.data = _.sortByOrder(info.data, ['датаЗап'], ['desc']);
                            info.data.reverse();
                        }
                    }
                },

                infoEmail: {},
                infoBirthday: {},
                infoDocIdentity: {},
                infoDocResident: {},
                infoAddress: {}
            };

            //
            function infoFix(node) {
                var info;

                _.each(INFO_BLOCKS, function(meta, key){
                    if (meta.fix) {
                        info = _.get(node.selfemployedInfo, key);

                        if (info) {
                            meta.fix(info);
                        }
                    }
                });
            }

            function buildSelfemployedState(node) {
                // прекращение ИП
                var status = _.get(node.selfemployedInfo, 'infoTermination.data["свСтатус"]');

                if (!status) {
                    return;
                }

                var _liquidate;

                node._liquidate = {
                    state: {
                        // intermediate: false
                        // _actual: ?,
                        // code: status['кодСтатус'],
                        _since: status['датаПрекращ'],
                        type: status['наимСтатус']
                    }
                };
            }

            function buildSelfemployedOKATO(node) {
                node.__okato = nkbReferenceRegionCode.getOKATOByUnitCode(nkbReferenceUtils.getRegionUnitCodeByORGNIP(
                    _.get(node.selfemployedInfo, 'ogrnip')
                ));
            }

            // API
            var selfemployedHelper = {
                buildSelfemployeNode: function(node) {
                    infoFix(node);
                    buildSelfemployedState(node);
                    // TODO remove when resolved https://bugtrack.nkb/issues/3300#note-6
                    buildSelfemployedOKATO(node);
                }
            };

            return selfemployedHelper;
        }]);
    //
});
