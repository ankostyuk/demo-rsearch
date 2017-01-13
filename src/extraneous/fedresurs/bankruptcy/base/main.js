/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('less!./styles/style');

    var template        = require('text!./views/view.html');

                          require('jquery');
                          require('lodash');

    var i18n            = require('i18n'),
        angular         = require('angular');

    var extmodules = {
        'np.directives':  require('np.directives')
    };

    var submodules = {
        'resource':       require('./resource')
    };

    //
    return angular.module('np.extraneous-fedresurs-bankruptcy', _.pluck(extmodules, 'name').concat(_.pluck(submodules, 'name')))
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .factory('npExtraneousFedresursBankruptcyHelper', ['$log', '$timeout', 'npExtraneousFedresursBankruptcyResource', function($log, $timeout, npExtraneousFedresursBankruptcyResource){
            /*
             * loading
             *
             */
            var loadingShowDelay = 500,
                loadingId;

            function loading(element, operation) {
                loadingId = _.uniqueId();

                process(loadingId, operation);

                function process(id, operation) {
                    var complete = false;

                    $timeout(function(){
                        if (!complete && id === loadingId) {
                            element.addClass('loading');
                        }
                    }, loadingShowDelay);

                    operation(done);

                    function done() {
                        $timeout(function(){
                            if (id === loadingId) {
                                element.removeClass('loading');
                                complete = true;
                            }
                        });
                    }
                }
            }

            function getMessageCount(searchType, search, success, error, complete) {
                if (_.isEmpty(search)) {
                    $log.warn('getMessageCount... error: search is blank');
                    errorCallback();
                    return null;
                }

                var request = npExtraneousFedresursBankruptcyResource.messageSearch({
                    searchType: searchType,
                    search: search,
                    success: function(data, status){
                        var result = getResultTotal(data);

                        if (!_.isNumber(result)) {
                            errorCallback();
                            return;
                        }

                        if (_.isFunction(success)) {
                            success(result);
                        }
                    },
                    error: errorCallback
                });

                function errorCallback() {
                    if (_.isFunction(error)) {
                        error();
                    }
                }

                return request;
            }

            function getResultTotal(result) {
                var r = _.get(result, 'messages.total');

                if (!_.isNumber(r)) {
                    r = null;
                }

                return r;
            }

            // API
            return {
                loading: loading,
                getResultTotal: getResultTotal,
                getMessageCount: getMessageCount
            };
        }])
        //
        .directive('npExtraneousFedresursBankruptcy', ['$log', '$rootScope', 'npExtraneousFedresursBankruptcyResource', 'npExtraneousFedresursBankruptcyHelper', function($log, $rootScope, npExtraneousFedresursBankruptcyResource, npExtraneousFedresursBankruptcyHelper){
            return {
                restrict: 'A',
                template: template,
                scope: {
                    searchType: '=npExtraneousFedresursBankruptcy'
                },
                link: function(scope, element, attrs) {
                    var search = {
                        params: null,
                        request: null,
                        result: {
                            'total': null,
                            'list': null
                        },
                        getTotal: function() {
                            return hasSearchResult() ? npExtraneousFedresursBankruptcyHelper.getResultTotal(search.result) || 0 : 0;
                        },
                        isEmptyResult: function() {
                            return !search.getTotal();
                        },
                        isNoResult: function() {
                            return search.noResult;
                        },
                        hasError: function() {
                            return search.error;
                        },
                        noResult: true,
                        error: null
                    };

                    $rootScope.$on('np-extraneous-fedresurs-bankruptcy-do-clear', function(){
                        clearSearch();
                    });

                    $rootScope.$on('np-extraneous-fedresurs-bankruptcy-do-search', function(e, options){
                        initSearch(options.search);
                        doSearch();
                    });

                    function hasSearchResult() {
                        return !_.isEmpty(search.result);
                    }

                    function initSearch(params) {
                        search.params = params;
                    }

                    function doSearch(success, error) {
                        resetSearchRequest();

                        npExtraneousFedresursBankruptcyHelper.loading(element, function(done){
                            searchRequest(function(hasError, result){
                                complete(hasError, result);
                                done();
                            });
                        });

                        function complete(hasError, result) {
                            if (!hasError) {
                                search.result = result;

                                if (_.isFunction(success)) {
                                    success();
                                }
                            } else {
                                search.error = true;

                                if (_.isFunction(error)) {
                                    error();
                                }
                            }
                        }
                    }

                    function resetSearchRequest() {
                        if (search.request) {
                            search.request.abort();
                        }
                    }

                    function clearSearch() {
                        resetSearchRequest();
                        search.result = {};
                        search.noResult = true;
                        search.error = null;
                    }

                    function searchRequest(callback) {
                        search.noResult = true;

                        search.request = npExtraneousFedresursBankruptcyResource.messageSearch({
                            searchType: scope.searchType,
                            search: search.params,
                            previousRequest: search.request,
                            success: function(data, status){
                                search.noResult = false;
                                search.error = null;
                                callback(false, data);
                            },
                            error: function(data, status){
                                search.noResult = false;
                                search.error = true;
                                callback(true);
                            }
                        });
                    }

                    //
                    _.extend(scope, {
                        search: search
                    }, i18n.translateFuncs);
                }
            };
        }]);
    //
});
