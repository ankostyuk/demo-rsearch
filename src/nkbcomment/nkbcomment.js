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

    var template                = require('text!./views/nkbcomment.html');

                  require('jquery');
                  require('underscore');
    var i18n    = require('i18n'),
        angular = require('angular');

    //
    return angular.module('np.nkbcomment', [])
        //
        .run(['appConfig', function(appConfig){
            MessageWidgetSettings.templates = messageWidgetTemplates;
            CommentWidgetSettings.templates = commentWidgetTemplates;
            CommentWidgetSettings.apiUrl = CommentUtils.API_URL = appConfig.resource['nkbcomment.api.url'];
            template = i18n.translateTemplate(template);
        }])
        //
        .factory('npNkbCommentHelper', ['$log', '$q', '$rootScope', function($log, $q, $rootScope){
            var initPromise = initComment();

            $rootScope.$on('app-user-apply', function(e, change){
                if (change.login) {
                    initComment();
                }
            });

            // TODO В CommentUtils.setupWidget `CommentUtils.USER_INFO = {}` при error
            function initComment() {
                var defer = $q.defer();

                CommentUtils.setupWidget('creditnet_ticket',
                    function() {
                        defer.resolve();
                        $rootScope.$emit('np-nkbcomment-init');
                    },
                    function() {
                        defer.resolve();
                        $rootScope.$emit('np-nkbcomment-init');
                    }
                );

                return defer.promise;
            }

            return {
                initPromise: function() {
                    return initPromise;
                }
            };
        }])
        //
        .directive('npNkbCommentWidget', ['$log', '$rootScope', 'npNkbCommentHelper', function($log, $rootScope, npNkbCommentHelper){
            return {
                restrict: 'A',
                scope: {
                    node: '=npNkbCommentWidget'
                },
                template: template,
                link: function(scope, element, attrs) {
                    var commentWidgetContainer = element.find('.comment-widget-container'),
                        commentWidget;

                    $rootScope.$on('np-nkbcomment-init', function(e){
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
                            return _.clean(node.name).toUpperCase();
                        }

                        return null;
                    }

                    /*
                     * scope
                     *
                     */
                    _.extend(scope, {
                        commentData: null,
                        CommentUtils: CommentUtils
                    });
                }
            };
        }]);
    //
});
