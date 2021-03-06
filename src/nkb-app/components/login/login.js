/**
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('lodash');
        angular         = require('angular');

    var submodules = {
        loginForm:        require('./login-form')
    };

    return angular.module('app.login', _.pluck(submodules, 'name'));
});
