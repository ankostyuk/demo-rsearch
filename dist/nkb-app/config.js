var root=this;root._APP_CONFIG={lang:{defaultLang:"ru"},meta:{lastSalesVolumeField:"p20103_2012",currencyOrder:1e3}},root._RESOURCES_CONFIG={baseUrl:"/rsearch",paths:{angular:"src/bower-components/angular/angular","angular-locale_ru":"src/bower-components/angular-i18n/angular-locale_ru","angular-locale_en":"src/bower-components/angular-i18n/angular-locale_en","ng-infinite-scroll":"src/bower-components/ngInfiniteScroll/ng-infinite-scroll",jquery:"src/bower-components/jquery/jquery","jquery.cookie":"src/bower-components/jquery.cookie/jquery.cookie",underscore:"src/bower-components/underscore/underscore","underscore.string":"src/bower-components/underscore.string/underscore.string",purl:"src/bower-components/purl/purl",uuid:"src/bower-components/node-uuid/uuid",i18n:"src/bower-components/nullpointer-i18n/i18n",backbone:"src/bower-components/backbone/backbone",iso8601:"src/bower-components/iso8601/iso8601",dateformat:"src/bower-components/dateformat/index","jquery.ui.widget":"src/bower-components/jquery-file-upload/jquery.ui.widget","jquery.iframe-transport":"src/bower-components/jquery-file-upload/jquery.iframe-transport","jquery.fileupload":"src/bower-components/jquery-file-upload/jquery.fileupload","jquery.fileDownload":"src/bower-components/jquery.fileDownload/jquery.fileDownload","nkbcomment-defaults":"src/bower-components/nkbcomment-defaults/index","nkbcomment-comment-utils":"src/bower-components/nkbcomment-comment-utils/index","nkbcomment-message-widget":"src/bower-components/nkbcomment-message-widget/index","nkbcomment-comment-widget":"src/bower-components/nkbcomment-comment-widget/index"},packages:[{name:"app",location:"src/nkb-app",main:"app"},{name:"app.login",location:"src/nkb-app/components/login",main:"login"},{name:"app.lang",location:"src/nkb-app/components/lang",main:"lang"},{name:"nkbcomment",location:"src/nkbcomment",main:"nkbcomment"},{name:"icons",location:"src/icons",main:"icons"},{name:"l10n",location:"src/l10n",main:"l10n"},{name:"resource",location:"src/resource",main:"resource"},{name:"user",location:"src/user",main:"user"},{name:"rsearch",location:"src/rsearch",main:"rsearch"}],shim:{angular:{exports:"angular"},"angular-locale_ru":{deps:["angular"]},"angular-locale_en":{deps:["angular"]},"ng-infinite-scroll":{deps:["angular"]},"jquery.cookie":{deps:["jquery"]},underscore:{exports:"_",deps:["underscore.string"],init:function(e){_.templateSettings={evaluate:/\{%([\s\S]+?)%\}/g,interpolate:/\{%=([\s\S]+?)%\}/g,escape:/\{%-([\s\S]+?)%\}/g},_.mixin(e)}},backbone:{deps:["underscore"]},dateformat:{deps:["iso8601"]},"nkbcomment-defaults":{deps:["backbone","underscore","jquery","jquery.cookie","jquery.fileupload","jquery.fileDownload","dateformat"]},"nkbcomment-comment-utils":{deps:["nkbcomment-defaults"]},"nkbcomment-message-widget":{deps:["nkbcomment-defaults"]},"nkbcomment-comment-widget":{deps:["nkbcomment-defaults","nkbcomment-comment-utils","nkbcomment-message-widget"]}},config:{i18n:{templateSettings:{evaluate:"",interpolate:/\$\{([\s\S]+?)\}/g,escape:""},escape:!1}},map:{"*":{css:"src/bower-components/require-css/css",less:"src/bower-components/require-less/less",text:"src/bower-components/requirejs-text/text"}},less:{relativeUrls:!0},urlArgs:(new Date).getTime()};