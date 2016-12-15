/**
 * @module nkb.reference.sub-federal-unit
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular');

    //
    var SUB_FEDERAL_UNIT_MAP = [
        // Республика Адыгея
        {unitCode: '01', carCodes: ['01'], okato: '79', isoCode: 'RU-AD'},
        // Республика Башкортостан
        {unitCode: '02', carCodes: ['02', '102'], okato: '80', isoCode: 'RU-BA'},
        // Республика Бурятия
        {unitCode: '03', carCodes: ['03'], okato: '81', isoCode: 'RU-BU'},
        // Республика Алтай
        {unitCode: '04', carCodes: ['04'], okato: '84', isoCode: 'RU-AL'},
        // Республика Дагестан
        {unitCode: '05', carCodes: ['05'], okato: '82', isoCode: 'RU-DA'},
        // Республика Ингушетия
        {unitCode: '06', carCodes: ['06'], okato: '26', isoCode: 'RU-IN'},
        // Кабардино-Балкарская республика
        {unitCode: '07', carCodes: ['07'], okato: '83', isoCode: 'RU-KB'},
        // Республика Калмыкия
        {unitCode: '08', carCodes: ['08'], okato: '85', isoCode: 'RU-KL'},
        // Карачаево-Черкесская республика
        {unitCode: '09', carCodes: ['09'], okato: '91', isoCode: 'RU-KC'},
        // Республика Карелия
        {unitCode: '10', carCodes: ['10'], okato: '86', isoCode: 'RU-KR'},
        // Республика Коми
        {unitCode: '11', carCodes: ['11', '111'], okato: '87', isoCode: 'RU-KO'},
        // Республика Марий Эл
        {unitCode: '12', carCodes: ['12'], okato: '88', isoCode: 'RU-ME'},
        // Республика Мордовия
        {unitCode: '13', carCodes: ['13', '113'], okato: '89', isoCode: 'RU-MO'},
        // Республика Саха (Якутия)
        {unitCode: '14', carCodes: ['14'], okato: '98', isoCode: 'RU-SA'},
        // Республика Северная Осетия — Алания
        {unitCode: '15', carCodes: ['15'], okato: '90', isoCode: 'RU-SE'},
        // Республика Татарстан
        {unitCode: '16', carCodes: ['16', '116'], okato: '92', isoCode: 'RU-TA'},
        // Республика Тыва
        {unitCode: '17', carCodes: ['17'], okato: '93', isoCode: 'RU-TY'},
        // Удмуртская республика
        {unitCode: '18', carCodes: ['18'], okato: '94', isoCode: 'RU-UD'},
        // Республика Хакасия
        {unitCode: '19', carCodes: ['19'], okato: '95', isoCode: 'RU-KK'},
        // Чеченская республика
        {unitCode: '20', carCodes: ['95'], okato: '96', isoCode: 'RU-CE'},
        // Чувашская республика
        {unitCode: '21', carCodes: ['21', '121'], okato: '97', isoCode: 'RU-CU'},
        // Алтайский край
        {unitCode: '22', carCodes: ['22'], okato: '01', isoCode: 'RU-ALT'},
        // Краснодарский край
        {unitCode: '23', carCodes: ['23', '93', '123', '193'], okato: '03', isoCode: 'RU-KDA'},
        // Красноярский край
        {unitCode: '24', carCodes: ['24', '124', '84', '88'], okato: '04', isoCode: 'RU-KYA'},
        // Приморский край
        {unitCode: '25', carCodes: ['25', '125'], okato: '05', isoCode: 'RU-PRI'},
        // Ставропольский край
        {unitCode: '26', carCodes: ['26', '126'], okato: '07', isoCode: 'RU-STA'},
        // Хабаровский край
        {unitCode: '27', carCodes: ['27'], okato: '08', isoCode: 'RU-KHA'},
        // Амурская область
        {unitCode: '28', carCodes: ['28'], okato: '10', isoCode: 'RU-AMU'},
        // Архангельская область
        {unitCode: '29', carCodes: ['29'], okato: '11', isoCode: 'RU-ARK'},
        // Астраханская область
        {unitCode: '30', carCodes: ['30'], okato: '12', isoCode: 'RU-AST'},
        // Белгородская область
        {unitCode: '31', carCodes: ['31'], okato: '14', isoCode: 'RU-BEL'},
        // Брянская область
        {unitCode: '32', carCodes: ['32'], okato: '15', isoCode: 'RU-BRY'},
        // Владимирская область
        {unitCode: '33', carCodes: ['33'], okato: '17', isoCode: 'RU-VLA'},
        // Волгоградская область
        {unitCode: '34', carCodes: ['34', '134'], okato: '18', isoCode: 'RU-VGG'},
        // Вологодская область
        {unitCode: '35', carCodes: ['35'], okato: '19', isoCode: 'RU-VLG'},
        // Воронежская область
        {unitCode: '36', carCodes: ['36', '136'], okato: '20', isoCode: 'RU-VOR'},
        // Ивановская область
        {unitCode: '37', carCodes: ['37'], okato: '24', isoCode: 'RU-IVA'},
        // Иркутская область
        {unitCode: '38', carCodes: ['38', '138', '85'], okato: '25', isoCode: 'RU-IRK'},
        // Калининградская область
        {unitCode: '39', carCodes: ['39', '91'], okato: '27', isoCode: 'RU-KGD'},
        // Калужская область
        {unitCode: '40', carCodes: ['40'], okato: '29', isoCode: 'RU-KLU'},
        // Камчатский край
        {unitCode: '41', carCodes: ['41'], okato: '30', isoCode: 'RU-KAM'},
        // Кемеровская область
        {unitCode: '42', carCodes: ['42', '142'], okato: '32', isoCode: 'RU-KEM'},
        // Кировская область
        {unitCode: '43', carCodes: ['43'], okato: '33', isoCode: 'RU-KIR'},
        // Костромская область
        {unitCode: '44', carCodes: ['44'], okato: '34', isoCode: 'RU-KOS'},
        // Курганская область
        {unitCode: '45', carCodes: ['45'], okato: '37', isoCode: 'RU-KGN'},
        // Курская область
        {unitCode: '46', carCodes: ['46'], okato: '38', isoCode: 'RU-KRS'},
        // Ленинградская область
        {unitCode: '47', carCodes: ['47'], okato: '41', isoCode: 'RU-LEN'},
        // Липецкая область
        {unitCode: '48', carCodes: ['48'], okato: '42', isoCode: 'RU-LIP'},
        // Магаданская область
        {unitCode: '49', carCodes: ['49'], okato: '44', isoCode: 'RU-MAG'},
        // Московская область
        {unitCode: '50', carCodes: ['50', '90', '150', '190', '750'], okato: '46', isoCode: 'RU-MOS'},
        // Мурманская область
        {unitCode: '51', carCodes: ['51'], okato: '47', isoCode: 'RU-MUR'},
        // Нижегородская область
        {unitCode: '52', carCodes: ['52', '152'], okato: '22', isoCode: 'RU-NIZ'},
        // Новгородская область
        {unitCode: '53', carCodes: ['53'], okato: '49', isoCode: 'RU-NGR'},
        // Новосибирская область
        {unitCode: '54', carCodes: ['54', '154'], okato: '50', isoCode: 'RU-NVS'},
        // Омская область
        {unitCode: '55', carCodes: ['55'], okato: '52', isoCode: 'RU-OMS'},
        // Оренбургская область
        {unitCode: '56', carCodes: ['56'], okato: '53', isoCode: 'RU-ORE'},
        // Орловская область
        {unitCode: '57', carCodes: ['57'], okato: '54', isoCode: 'RU-ORL'},
        // Пензенская область
        {unitCode: '58', carCodes: ['58'], okato: '56', isoCode: 'RU-PNZ'},
        // Пермский край
        {unitCode: '59', carCodes: ['59', '81', '159'], okato: '57', isoCode: 'RU-PER'},
        // Псковская область
        {unitCode: '60', carCodes: ['60'], okato: '58', isoCode: 'RU-PSK'},
        // Ростовская область
        {unitCode: '61', carCodes: ['61', '161'], okato: '60', isoCode: 'RU-ROS'},
        // Рязанская область
        {unitCode: '62', carCodes: ['62'], okato: '61', isoCode: 'RU-RYA'},
        // Самарская область
        {unitCode: '63', carCodes: ['63', '163'], okato: '36', isoCode: 'RU-SAM'},
        // Саратовская область
        {unitCode: '64', carCodes: ['64', '164'], okato: '63', isoCode: 'RU-SAR'},
        // Сахалинская область
        {unitCode: '65', carCodes: ['65'], okato: '64', isoCode: 'RU-SAK'},
        // Свердловская область
        {unitCode: '66', carCodes: ['66', '96', '196'], okato: '65', isoCode: 'RU-SVE'},
        // Смоленская область
        {unitCode: '67', carCodes: ['67'], okato: '66', isoCode: 'RU-SMO'},
        // Тамбовская область
        {unitCode: '68', carCodes: ['68'], okato: '68', isoCode: 'RU-TAM'},
        // Тверская область
        {unitCode: '69', carCodes: ['69'], okato: '28', isoCode: 'RU-TVE'},
        // Томская область
        {unitCode: '70', carCodes: ['70'], okato: '69', isoCode: 'RU-TOM'},
        // Тульская область
        {unitCode: '71', carCodes: ['71'], okato: '70', isoCode: 'RU-TUL'},
        // Тюменская область
        {unitCode: '72', carCodes: ['72'], okato: '71', isoCode: 'RU-TYU'},
        // Ульяновская область
        {unitCode: '73', carCodes: ['73', '173'], okato: '73', isoCode: 'RU-ULY'},
        // Челябинская область
        {unitCode: '74', carCodes: ['74', '174'], okato: '75', isoCode: 'RU-CHE'},
        // Забайкальский край
        {unitCode: '75', carCodes: ['75', '80'], okato: '76', isoCode: 'RU-ZAB'},
        // Ярославская область
        {unitCode: '76', carCodes: ['76', '176'], okato: '78', isoCode: 'RU-YAR'},
        // Москва
        {unitCode: '77', carCodes: ['77', '97', '99', '177', '197', '199', '777'], okato: '45', isoCode: 'RU-MOW'},
        // Санкт-Петербург
        {unitCode: '78', carCodes: ['78', '98', '178'], okato: '40', isoCode: 'RU-SPB'},
        // Еврейская автономная область
        {unitCode: '79', carCodes: ['79'], okato: '99', isoCode: 'RU-YEV'},
        // Ненецкий автономный округ
        {unitCode: '83', carCodes: ['83'], okato: '111', isoCode: 'RU-NEN'},
        // Ханты-Мансийский автономный округ - Югра
        {unitCode: '86', carCodes: ['86', '186'], okato: '7110', isoCode: 'RU-KHM'},
        // Чукотский автономный округ
        {unitCode: '87', carCodes: ['87'], okato: '77', isoCode: 'RU-CHU'},
        // Ямало-Ненецкий автономный округ
        {unitCode: '89', carCodes: ['89'], okato: '7114', isoCode: 'RU-YAN'},
        // Республика Крым
        {unitCode: '91', carCodes: ['82'], okato: '35', isoCode: 'RU-CR'},
        // Севастополь
        {unitCode: '92', carCodes: ['92'], okato: '67', isoCode: 'RU-SEV'},
        // Территории, находящиеся за пределами РФ и обслуживаемые Управлением режимных объектов МВД России, Байконур
        {unitCode: null, carCodes: ['94'], okato: null, isoCode: null}
    ];

    var BY_UNIT_CODE_MAP = _.groupBy(SUB_FEDERAL_UNIT_MAP, 'unitCode');

    //
    return angular.module('nkb.reference.sub-federal-unit', [])
        //
        .factory('nkbReferenceRegionCode', ['$log', function($log){

            function getDataByUnitCode(unitCode) {
                return _.get(BY_UNIT_CODE_MAP[unitCode], '[0]');
            }

            //
            return {
                getOKATOByUnitCode: function(unitCode) {
                    return _.get(getDataByUnitCode(unitCode), 'okato');
                }
            };
        }]);
    //
});
