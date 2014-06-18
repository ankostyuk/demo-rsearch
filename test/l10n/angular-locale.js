//
define(function(require, exports, module) {
    var langs = {
        en: require('text!angular-locale_en.js'),
        ru: require('text!angular-locale_ru.js')
    };

    return {
        setLocale: function(lang){
            return eval(langs[lang]);
        }
    };
});
