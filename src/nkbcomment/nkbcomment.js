/**
 * @module nkbcomment
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                                  require('nkbcomment-defaults');
                                  require('nkbcomment-comment-utils');
                                  require('nkbcomment-message-widget');
                                  require('nkbcomment-comment-widget');
    var messageWidgetTemplates  = require('text!../src/bower-components/nkbcomment-message-widget.templates/index.html'),
        commentWidgetTemplates  = require('text!../src/bower-components/nkbcomment-comment-widget.templates/index.html');

                  require('jquery');
                  require('underscore');
    var angular = require('angular');

    //
    return angular.module('np.nkbcomment', [])
        //
        .run(['appConfig', function(appConfig){
            MessageWidgetSettings.templates = messageWidgetTemplates;
            CommentWidgetSettings.templates = commentWidgetTemplates;
            CommentWidgetSettings.apiUrl = CommentUtils.API_URL = appConfig.resource['nkbcomment.api.url'];
        }])
        //
        .factory('npNkbCommentHelper', ['$log', '$q', '$rootScope', function($log, $q, $rootScope){
            var initDefer = $q.defer();

            CommentUtils.setupWidget('creditnet_ticket', function() {
                initDefer.resolve();
                $rootScope.$emit('np-nkbcomment-ready');
            });

            return {
                initPromise: function() {
                    return initDefer.promise;
                }
            };
        }])
        //
        .directive('npNkbCommentWidget', ['$log', 'npNkbCommentHelper', function($log, npNkbCommentHelper){
            return {
                restrict: 'A',
                scope: false, // require <node>
                link: function(scope, element, attrs) {
                    var commentWidget;

                    npNkbCommentHelper.initPromise().then(function(){
                        commentWidget = new CommentWidget({
                            container: element
                        });
                    });

                    scope.$watch('node', function(newNode, oldNode) {
                        checkComment(newNode);
                    });

                    function checkComment(node) {
                        if (!commentWidget) {
                            return;
                        }

                        var postId = getPostId(node);

                        if (!postId) {
                            commentWidget.hide();
                            return;
                        }

                        commentWidget.show(0, 0, postId);
                    }

                    function getPostId(node) {
                        if (!node) {
                            return null;
                        }

                        if (node._type === 'COMPANY') {
                            return '/bsnId:' + node.bsn_id + '/blocks/cnblk04';
                        } else
                        if (node._type === 'INDIVIDUAL') {
                            // TODO
                            return null;
                        }

                        return null;
                    }
                }
            };
        }]);
    //
});
