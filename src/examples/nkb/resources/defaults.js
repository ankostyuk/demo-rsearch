// Underscore.js templating setup
_.templateSettings = {
    evaluate    : /\{%([\s\S]+?)%\}/g,
    interpolate : /\{%=([\s\S]+?)%\}/g,
    escape      : /\{%-([\s\S]+?)%\}/g
};

// Include Underscore.string methods to Underscore namespace
_.mixin(_.str.exports());

// jQuery setup
$.ajaxSetup({
    cache: false
});

//Commons
var Utils = {
    formatNumber: function(number, options, precision) {
        var format = options.format;
        
        if (_.isNumber(precision)) {
            format = options.format.slice(0);
            format[0] = precision;
        }
        
        if (!options.humanize.round && format[0] !== 0) {
            var decimals = format[0];
            
            var d = Math.pow(10, decimals);
            
            var number = Math.round(number * d) / d;
            
            var numberStr = '' + number;
            var i = numberStr.indexOf('.');
            var fractionalSize = (i >= 0 ? numberStr.substring(i + 1).length : 0);
            
            if (fractionalSize !== decimals) {
                format = options.format.slice(0);
                format[0] = fractionalSize;
            }
        }
        
        var args = _.union([number], format);
        
        return _.numberFormat.apply(this, args);
    },
    
    humanizeNumder: function(number, precision, formatOptions) {
        var numderSizes = formatOptions.numderSizes;
        
        if (!_.isNumber(number)) {
            return numderSizes[0];
        }
        
        var i = 1;
        while (number >= 1000 && (i < numderSizes.length - 1)) {
            i++;
            number = number / 1000;
        }
        
        var nf = Utils.formatNumber(number, formatOptions, precision);
        
        return $.trim(nf.replace(/\.0+$/, '') + (numderSizes[i] ? (' ' + numderSizes[i]) : ''));
    },
    
    isBlankValue: function(value) {
        return (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) || value === '');
    },
    
    getObjectProperty: function(obj, path) {
        var arr = path.split('.');
        while (arr.length && (obj = obj[arr.shift()]));
        return obj;
    },
    
    getDeltaTime: function(startDate) {
        return (new Date().getTime() - startDate.getTime()) / 1000;
    }
};

var DateUtils = {
   formatDateTime: function(value, format) {
       var date = _.isString(value) ? new Date(Date.parse(value)) : new Date(value);
       return date.format(format ? format : 'dd.mm.yyyy HH:MM');
   }
};