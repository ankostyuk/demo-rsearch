//
var _       = require("lodash"),
    _d      = require("lodash-deep"),
    path    = require('path'),
    webapp  = require('nullpointer-web-app');

_.mixin(_d);

//
module.exports = function(grunt) {
    webapp.setBuildMeta({
        cwd: __dirname,
        name: 'nkb-app',
        rootpath: '/rsearch/'
    });

    var gruntConfig = webapp.getDefaultGruntConfig(),
        buildMeta   = webapp.getBuildMeta();

    // extend copy
    _.deepGet(gruntConfig, 'copy.dist.src').push('src/nkb-app/opensearch.xml');

    // extend i18n
    _.deepSet(gruntConfig, 'i18n.ui_keys.options', {
        mode:           'simple',
        pattern:        '**/*.txt',
        inputDir:       path.resolve(__dirname, 'i18n/ui_keys/src'),
        inputRootPath:  path.resolve(__dirname, ''),
        outputDir:      path.resolve(__dirname, 'i18n/ui_keys'),
        bundleDir:      path.resolve(__dirname, 'src/l10n/ui_keys'),
        baseLang:       buildMeta.langs[0],
        langs:          buildMeta.langs
    });
    _.deepSet(gruntConfig, 'i18n.okato_region.options', {
        mode:           'simple',
        pattern:        '**/*.txt',
        inputDir:       path.resolve(__dirname, 'i18n/okato_region/src'),
        inputRootPath:  path.resolve(__dirname, ''),
        outputDir:      path.resolve(__dirname, 'i18n/okato_region'),
        bundleDir:      path.resolve(__dirname, 'src/l10n/okato_region'),
        baseLang:       buildMeta.langs[0],
        langs:          buildMeta.langs
    });

    webapp.initGrunt(grunt, gruntConfig);
};
