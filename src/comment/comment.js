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

    var messageWidgetTemplates  = require('text!../external_components/nkbcomment/nkbcomment-message-widget/view/message-widget-templates.html'),
        commentWidgetTemplates  = require('text!../external_components/nkbcomment/nkbcomment-comment-widget/view/comment-widget-templates.html');
                                  require('css!../external_components/nkbcomment/nkbcomment-message-widget/css/message-widget.css');
                                  require('css!../external_components/nkbcomment/nkbcomment-comment-widget/css/comment-widget.css');

    var template                = require('text!./views/comment.html');

                  require('jquery');
                  require('lodash');
    var i18n    = require('i18n'),
        angular = require('angular');

    //
    return angular.module('nkb.comment', [])
        //
        .run(['nkbCommentConfig', function(nkbCommentConfig){
            MessageWidgetSettings.templates = messageWidgetTemplates;
            CommentWidgetSettings.templates = commentWidgetTemplates;
            CommentWidgetSettings.apiUrl = CommentUtils.API_URL = nkbCommentConfig.resource['api.url'];
            template = i18n.translateTemplate(template);
        }])
        //
        .factory('nkbCommentHelper', ['$log', '$q', '$rootScope', function($log, $q, $rootScope){

            function initComment() {
                var defer = $q.defer();

                CommentUtils.setupWidget('creditnet_ticket', complete, complete);

                function complete() {
                    defer.resolve();
                }

                return defer.promise;
            }

            return {
                initComment: initComment
            };
        }])
        //
        .directive('nkbCommentWidget', ['$log', '$rootScope', 'nkbCommentHelper', function($log, $rootScope, nkbCommentHelper){
            return {
                restrict: 'A',
                scope: {
                    node: '=nkbCommentWidget'
                },
                template: template,
                link: function(scope, element, attrs) {
                    var commentWidgetContainer = element.find('.comment-widget-container'),
                        commentWidget;

                    initComment();

                    $rootScope.$on('nkb-user-apply', function(e, change){
                        if (change.login) {
                            initComment();
                        }
                    });

                    scope.$watch('node', function(newNode, oldNode) {
                        checkComment(newNode);
                    });

                    function initComment() {
                        nkbCommentHelper.initComment().then(function(){
                            commentWidgetContainer.empty();

                            commentWidget = new CommentWidget({
                                container: commentWidgetContainer,
                                onChange: function(data){
                                    scope.commentData = data;
                                    scope.$apply();
                                }
                            });

                            checkComment(scope.node);
                        });
                    }

                    function checkComment(node) {
                        scope.commentData = null;

                        if (!commentWidget) {
                            return;
                        }

                        var postId = getPostId(node);

                        if (!postId) {
                            commentWidget.hide();
                            return;
                        }

                        var title = getTitle(node);

                        commentWidget.show(0, 0, postId, {title: title});
                    }

                    function getPostId(node) {
                        if (!node) {
                            return null;
                        }

                        if (node._type === 'COMPANY') {
                            return '/bsnId:' + node.bsn_id + '/blocks/cnblk04';
                        } else
                        if (node._type === 'INDIVIDUAL' && !node.subtype) {
                            return _.clean(node.name).toUpperCase();
                        }

                        return null;
                    }

                    function getTitle(node) {
                        if (!node) {
                            return null;
                        }

                        if (node._type === 'COMPANY') {
                            return node.nameshortsort || node.namesort;
                        } else
                        if (node._type === 'INDIVIDUAL' && !node.subtype) {
                            return node.name;
                        }

                        return null;
                    }

                    /*
                     * scope
                     *
                     */
                    _.extend(scope, {
                        commentData: null,
                        addComment: function() {
                            commentWidget.showAddComment();
                        },
                        isShowComments: function() {
                            return scope.commentData && scope.commentData.postId && CommentUtils.hasUserPermission('VIEW');
                        }
                    });
                }
            };
        }]);
    //
});
