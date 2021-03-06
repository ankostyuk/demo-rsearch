# Алгоритм актуальности связей

В данном документе описан алгоритм актуальности связей с примерами работы алгоритма на данных Прода от 09.07.2016.

## Выставление актуальности связей

Алгоритм выставляет актуальность для связей Учредители, Руководители.

### Принцип работы алгоритма

Алгоритм группирует связи по ключу `<источник>+<дата источника>` и сортирует сформированные группы в последованности:

1. по убыванию максимальной даты начала действия в наборе связей в группе
2. по источникам
3. по убыванию даты актуальности источника

После сортировки, связи в первой группе считаются актуальными, в следующих группах: считаются актуальными, если:
* связь "нестрогой актуальности" и
    * приоритет источника выше приоритета источника в первой группе (только в первой попавшейся группе с таким условием) или
    * дата актуальности источника больше или равна дате актуальности источника в первой группе,
иначе -- считаются неактуальными.

## Схлопывание связей

Схлопывание связей осуществляется для:
* устранения дубликатов связей
* корректировки дат начала действия и актуальности связей

### Принцип работы алгоритма

Алгоритм группирует схлопываемые связи по ключу `<тип связи>+<идентификатор связанного объекта>` и сортирует связи в каждой группе в последованности:
1. по возрастанию флага неактуальности
2. по убыванию даты действия
3. по убыванию даты актуальности источника

После сортировки, связи схлопываются:
* Учредители. Если доли эквивалентны: доли в руб. -- с округлением до целого, доли в % -- с округлением до 2-го дробного знака.
* Руководители. Если должности эквивалентны: равны при приведении к одному регистру.

В схлопнутой связи выставляются специфические для связи свойства по принципу: приоритет значений устанавливаемых свойств у связи с большей датой актуальности источника.

В схлопнутой связи выставляются свойства:
* дата действия -- минимальная
* дата актуальности -- максимальная
* наименование источника -- с большей датой актуальности

## Примеры

В приведенных примерах:

* отображаются "технические" наименования источников связей:
    * `rosstat` -- `Росстат`
    * `egrul` -- `ЕГРЮЛ`
    * `xegrul` -- `Селдон ЕГРЮЛ`
    * `eaf` -- `Архив ЕГРЮЛ`
    * `egrul_individual_founder` -- `ЕГРЮЛ по учредителю`
    * `egrul_individual_executive` -- `ЕГРЮЛ по руководителю`


* неактуальные связи помечаются символом `∅` -- пустое множество

* отображаются только наименования компаний, ФИО и связи

* в некоторых примерах не приводятся Учредители или Руководители, если имеется только один учредитель или руководитель или приведение учредителей или руководителей несущественно для конретного примера

* в некоторых примерах для сравнения и разъяснения будут приведены "сырые" связи -- без выставления актуальности и схлопывания

### ОАО САНАТОРИЙ "БЕЛЫЕ КЛЮЧИ" ОГРН 1021000513203 ОКПО 24801153

#### Учредители

```
ОАО САНАТОРИЙ "БЕЛЫЕ КЛЮЧИ" / 8 учредителей компаний

1.
доля 75,12%  3 491 082 руб. — с 19.01.2016 rosstat от 29.02.2016
ГОСУДАРСТВЕННЫЙ КОМИТЕТ РК ПО УПРАВЛЕНИЮ ГОСУДАРСТВЕННЫМ ИМУЩЕСТВОМ

2.
доля 4,54%  210 762 руб. — с 19.01.2016 rosstat от 29.02.2016
ООО "КУЛЬТУРНО-ДЕЛОВОЙ ЦЕНТР"

3.
доля 4,08%  189 594 руб. — с 19.01.2016 rosstat от 29.02.2016
ОАО "Карелстрой"

4.
доля 2,27%  105 390 руб. — с 19.01.2016 rosstat от 29.02.2016
ООО "МЕДИЦИНСКИЙ ЦЕНТР "МАРЦИАЛЬНЫЕ ВОДЫ"

5.
доля 2,05%  95 472 руб. — с 19.01.2016 rosstat от 29.02.2016
ОАО "Станкозавод"

6.
доля 1,48%  68 616 руб. — с 19.01.2016 rosstat от 29.02.2016
ОАО "Целлюлозный завод "Питкяранта"

7.
доля 0,53%  24 552 руб. — с 19.01.2016 rosstat от 29.02.2016
ФГБУ "ПЕТРОЗАВОДСКИЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ"

8.
доля 0,4%  18 522 руб. — с 19.01.2016 rosstat от 29.02.2016
ООО "Коммерческий центр ДОК"
```

Все учредители актуальные

#### Руководители

```
ОАО САНАТОРИЙ "БЕЛЫЕ КЛЮЧИ" / 2 руководителя

ГЕНЕРАЛЬНЫЙ ДИРЕКТОР — с 24.06.2014 egrul от 04.07.2016
единоличный исполнительный орган
контактное лицо
Зиновьева Алла Ивановна

--- История ---

∅ Генеральный директор — с 02.08.2005 xegrul от 18.08.2013
∅ генеральный директор, главный врач — с 05.09.2002 xegrul от 28.02.2005
контактное лицо
Бутаковская Нина Владиславовна
```


### ГБУ ДТСЗН ГОРОДА МОСКВЫ ОГРН 1037704003270 ОКПО 03171831

#### Учредители

```
ГБУ ДТСЗН ГОРОДА МОСКВЫ / 2 учредителя компании

1.
учредитель — с 31.03.2008 rosstat от 29.02.2016
Правительство Москвы

2.
учредитель — с 29.01.2003 egrul от 14.07.2016
УБПГЗ
```

Все учредители актуальные, т.к. Правительство Москвы из Росстата от 29.02.2016, а УБПГЗ из ЕГРЮЛ от 14.07.2016 -- позднее данных из Росстата.

См. [Использование приоритета источника в зависимости от ОПФ]


### ФГАНУ НИИХП ОГРН 5077746432594 ОКПО 05747152

#### Учредители

```
ФГАНУ НИИХП / 2 учредителя компании

1.
учредитель — с 07.04.2014 rosstat от 29.02.2016
ФАНО России

2.
учредитель — с 29.03.2007 egrul от 21.06.2016
Россельхозакадемия
```

Все учредители актуальные, т.к. ФАНО России из Росстата от 29.02.2016, а Россельхозакадемия из ЕГРЮЛ от 21.06.2016 -- позднее данных из Росстата.

См. [Использование приоритета источника в зависимости от ОПФ]


### НП "ТП "ХРАНЕНИЕ И ПЕРЕРАБОТКА - 2030" ОГРН 1107799019316 ОКПО 66955953

#### Учредители

```
НП "ТП "ХРАНЕНИЕ И ПЕРЕРАБОТКА - 2030" / 10 учредителей

1 учредитель физическое лицо

учредитель — с 16.12.2013 rosstat от 29.02.2016
20524389-Оо "Мак"

9 учредителей компаний

1.
учредитель — с 08.06.2010 egrul от 05.07.2016
ООО "ВПС"

2.
учредитель — с 08.06.2010 egrul от 05.07.2016
ООО "Плант"

3.
учредитель — с 08.06.2010 egrul от 05.07.2016
РОО "Федерация работников общественного питания"

4.
учредитель — с 08.06.2010 egrul от 05.07.2016
ЗАО "МЕЖРЕГИОНПРОМ"

5.
учредитель — с 08.06.2010 egrul от 05.07.2016
ФГАНУ НИИХП

6.
учредитель — с 08.06.2010 egrul от 05.07.2016
ООО "АМУРР"

7.
учредитель — с 08.06.2010 egrul от 05.07.2016
ФГБОУ ВО "МГУТУ ИМ. К.Г. РАЗУМОВСКОГО (ПКУ)"

8.
учредитель — с 08.06.2010 egrul от 05.07.2016
ЗАО "БМЗ"

9.
учредитель — с 08.06.2010 egrul от 05.07.2016
РОО "МАК"
```

Все учредители актуальные


### ООО "РОДЕКС" ОГРН 5147746194680 ОКПО 39552394

#### Учредители

```
ООО "РОДЕКС" / 2 учредителя физических лица

1.
доля 50%  10 000 руб. — с 18.04.2016 xegrul от 19.04.2016
∅ доля 100%  10 000 руб. — с 07.10.2014 xegrul от 18.04.2016
∅ ГЕНЕРАЛЬНЫЙ ДИРЕКТОР — с 07.10.2014 rosstat от 29.02.2016
Базаров Евгений Степанович

2.
доля 50%  10 000 руб. — с 18.04.2016 xegrul от 19.04.2016
ГЕНЕРАЛЬНЫЙ ДИРЕКТОР — с 15.04.2016 xegrul от 19.04.2016
Рождественский Павел Евгеньевич
```

Все учредители актуальные


#### Руководители

```
ООО "РОДЕКС" / 2 руководителя

ГЕНЕРАЛЬНЫЙ ДИРЕКТОР — с 15.04.2016 xegrul от 19.04.2016
доля 50%  10 000 руб. — с 18.04.2016 xegrul от 19.04.2016
Рождественский Павел Евгеньевич

--- История ---

∅ ГЕНЕРАЛЬНЫЙ ДИРЕКТОР — с 07.10.2014 rosstat от 29.02.2016
доля 50%  10 000 руб. — с 18.04.2016 xegrul от 19.04.2016
∅ доля 100%  10 000 руб. — с 07.10.2014 xegrul от 18.04.2016
Базаров Евгений Степанович
```


### ООО "ПАРК-ОТЕЛЬ "СЯМОЗЕРО" ОГРН 1071038000989 ОКПО 83735466

#### Руководители

```
ООО "ПАРК-ОТЕЛЬ "СЯМОЗЕРО" / 3 руководителя

Директор — с 26.01.2009 egrul от 05.07.2016
доля 100%  10 000 руб. — с 07.11.2007 egrul от 05.07.2016
контактное лицо
Решетова Елена Васильевна

--- История ---

1.
∅ Директор — с 10.04.2008 xegrul от 24.11.2008
Решетов Юрий Владимирович

2.
∅ Директор — с 07.11.2007 xegrul от 30.12.2007
Зиновьева Светлана Валентиновна
```


### ООО "КЛИНИКА МОСМЕД" ОГРН 1127746395810 ОКПО 09811527

#### Учредители

```
ООО "КЛИНИКА МОСМЕД" / 3 учредителя

2 учредителя физических лица

1.
доля 70%  7 000 руб. — с 17.12.2013 xegrul от 23.12.2013
ГЕНЕРАЛЬНЫЙ ДИРЕКТОР — с 23.05.2012 rosstat от 29.02.2016
Клубков Владимир Константинович

2.
доля 30%  3 000 руб. — с 17.12.2013 xegrul от 23.12.2013
Крылова Евгения Михайловна

--- История ---

1 учредитель компания

∅ доля 100%  10 000 руб. — с 23.05.2012 xegrul от 14.08.2013
НП "МЕДИЦИНСКИЙ ЦЕНТР "ПУЛЬС"
```


### ООО "КарелияОпен" ОГРН 1021000533322 ОКПО 46717720

#### Учредители

```
ООО "КарелияОпен" / 6 учредителей

1 учредитель физическое лицо

доля 100%  10 000 000 руб. — с 14.04.2005 xegrul от 20.04.2015
∅ доля 50%  5 000 000 руб. — с 16.09.2004 xegrul от 09.06.2009
ДИРЕКТОР — с 16.06.2003 rosstat от 29.02.2016
Решетова Елена Васильевна

--- История ---

2 учредителя физических лица

1.
∅ доля 26%  2 600 000 руб. — с 19.11.2004 xegrul от 09.06.2009
Андреева Александра Геннадьевна

2.
∅ доля 26%  2 600 000 руб. — с 16.09.2004 xegrul от 09.06.2009
∅ доля 76%  7 600 000 руб. — с 02.09.2004 xegrul от 09.06.2009
Тринчин Владимир Иванович

3 учредителя компании

1.
∅ доля 24%  2 400 000 руб. — с 02.09.2004 xegrul от 30.06.2009
∅ доля 100%  10 000 000 руб. — с 25.09.2003 xegrul от 09.06.2009
ОАО "Инавтомаркет М"

2.
∅ доля 21,99%  2 199 000 руб. — с 31.12.2002 xegrul от 09.06.2009
ООО КОМПАНИЯ "ДИАЙ"

3.
∅ доля 21,99%  2 199 000 руб. — с 02.12.2002 xegrul от 09.06.2009
ОАО "Онежский тракторный завод"
```

#### Руководители

```
ООО "КарелияОпен" / 3 руководителя

ДИРЕКТОР — с 16.06.2003 rosstat от 29.02.2016
доля 100%  10 000 000 руб. — с 14.04.2005 xegrul от 20.04.2015
∅ доля 50%  5 000 000 руб. — с 16.09.2004 xegrul от 09.06.2009
Решетова Елена Васильевна

--- История ---

1.
∅ Директор — с 04.11.2003 xegrul от 28.02.2005
Елина Светлана Тауновна

2.
∅ Директор — с 02.12.2002 xegrul от 21.02.2005
Мартынова Наталья Антоновна
```

Данные по неактуальным руководителям только из Селдона.

Дата действия актуального руководителя раньше, чем у одного из неактуальных руководителей, по причине наличия данных из Селдона `директор — с 16.06.2003 xegrul от 24.02.2005`:

```
"Сырые данные"
ООО "КарелияОпен" / 3 руководителя

1.
ДИРЕКТОР — с 28.07.2007 rosstat от 29.02.2016
Директор — с 24.08.2004 xegrul от 20.04.2015
...
директор — с 16.06.2003 xegrul от 24.02.2005
...
доля 100%  10 000 000 руб. — с 26.11.2009 xegrul от 20.04.2015
...
доля 50%  5 000 000 руб. — с 25.12.2004 xegrul от 09.06.2009
...
Решетова Елена Васильевна

2.
Директор — с 04.11.2003 xegrul от 28.02.2005
Директор — с 04.11.2003 xegrul от 25.02.2005
Елина Светлана Тауновна

3.
Директор — с 02.12.2002 xegrul от 21.02.2005
Мартынова Наталья Антоновна
```

...и при схлопывании связей дата действия была выставлена именно 16.06.2003, т.к. данная дата мимнимальная, а источник был выставлен Росстат, см. [Схлопывание связей]

Наличие именно таких данных может быть объяснено либо ошибкой в источнике данных, либо реальной ситуацией:

Руководителем была Решетова Елена Васильевна с 16.06.2003, затем Елина Светлана Тауновна с 04.11.2003, затем опять Решетова Елена Васильевна с 24.08.2004.


### АО "РЕЕСТР" ОГРН 1027700047275 ОКПО 17771492

#### Учредители

```
АО "РЕЕСТР" / 24 учредителя

1 учредитель физическое лицо
доля 0,5%  27 000 руб. — с 09.01.2014 rosstat от 29.02.2016
17826626-Зао "Ивк"

23 учредителя компании

1.
доля 16,59%  889 790 руб. — с 09.01.2014 rosstat от 29.02.2016
ЗАО "ЛАМИНЕЯ"

2.
доля 1,17%  63 000 руб. — с 09.01.2014 rosstat от 29.02.2016
ОАО "БАНК МОСКВЫ"

3.
доля 1,14%  61 000 руб. — с 09.01.2014 rosstat от 29.02.2016
ЗАО "ВП АКТИВ"

4.
доля 0,41%  22 000 руб. — с 09.01.2014 rosstat от 29.02.2016
ООО "ЭЛГА"

5.
доля 0,09%  5 000 руб. — с 09.01.2014 rosstat от 29.02.2016
КП "Фонд государственного имущества Астраханской области"

6.
доля 16,59%  889 790 руб. — с 22.07.2002 egrul от 20.06.2016
АО "ПРОМТОРГЦЕНТР"

7.
доля 0,21%  11 000 руб. — с 22.07.2002 egrul от 20.06.2016
ЗАО "ВРК"

8.
доля 0,06%  3 000 руб. — с 22.07.2002 egrul от 20.06.2016
ФОНД ИМУЩЕСТВА КАЛУЖСКОЙ ОБЛАСТИ

9.
учредитель — с 22.07.2002 egrul от 20.06.2016
ОАО ВАО "ИНТУРИСТ"

10.
учредитель — с 22.07.2002 egrul от 20.06.2016
ПАО "МТС-БАНК"

11.
учредитель — с 22.07.2002 egrul от 20.06.2016
ПАО МГТС

12.
учредитель — с 22.07.2002 egrul от 20.06.2016
ООО "НАНДИ НЭШНЛ ДИСТРИБЬЮШН"

13.
учредитель — с 22.07.2002 egrul от 20.06.2016
ПАО "МОССТРОЙПЛАСТМАСС"

14.
учредитель — с 22.07.2002 egrul от 20.06.2016
ПАО "МАК "ВЫМПЕЛ"

15.
учредитель — с 22.07.2002 egrul от 20.06.2016
ОАО "БУСИНОВСКИЙ МПК"

16.
учредитель — с 22.07.2002 egrul от 20.06.2016
одна группа лиц, доля более 20%, доля УК 9,41%, доля акций 9,41%
АО "РЕЕСТР-КОНСАЛТИНГ"

17.
учредитель — с 22.07.2002 egrul от 20.06.2016
РОССИЙСКИЙ ФОНД ФЕДЕРАЛЬНОГО ИМУЩЕСТВА

18.
учредитель — с 22.07.2002 egrul от 20.06.2016
ОАО АФК "СИСТЕМА"

19.
учредитель — с 22.07.2002 egrul от 20.06.2016
ДИГМ

20.
учредитель — с 22.07.2002 egrul от 20.06.2016
ОАО ИФК "АДЫГЕЯ-ИНВЕСТ"

21.
учредитель — с 22.07.2002 egrul от 20.06.2016
ОАО СК "АЛЬЯНС"

22.
учредитель — с 22.07.2002 egrul от 20.06.2016
АКБ "ВНЕШАГРОБАНК" (ОАО)

23.
учредитель — с 22.07.2002 egrul от 20.06.2016
ОАО "ЗАБАЙКАЛИНВЕСТСЕРВИС"
```

Все учредители актуальные

#### Руководители

```
АО "РЕЕСТР" / 2 руководителя

ГЕНЕРАЛЬНЫЙ ДИРЕКТОР — с 15.03.2004 egrul от 20.06.2016
член совета директоров, единоличный исполнительный орган, одна группа лиц
Тарановский Юрий Эдуардович

--- История ---

∅ руководитель — с 22.07.2002 xegrul от 31.08.2005
Семенов Александр Симхович
```


### ООО "ВИМА" ОГРН 1025004064150 ОКПО 45693006

```
ООО "ВИМА"      основано 10.02.1997
* Нетолканов Сергей Николаевич
* Московская Область, г Одинцово, ул Молодежная, д 48
ОГРН 1025004064150 ИНН 5032042179 ОКПО 45693006
```

#### Руководители

```
ООО "ВИМА" / 2 руководителя

Генеральный директор — с 13.10.2010 egrul от 07.07.2016
Гутковский Игорь Николаевич

--- История ---

∅ ГЕНЕРАЛЬНЫЙ ДИРЕКТОР — с 31.10.2002 rosstat от 29.02.2016
доля 10%  1 300 руб. — с 15.07.2010 egrul от 07.07.2016
...
Нетолканов Сергей Николаевич
```

В карточке компании руководитель -- Нетолканов Сергей Николаевич, в списке руководителей Нетолканов Сергей Николаевич неактуальный, Гутковский Игорь Николаевич актуальный, т.к. есть данные из ЕГРЮЛ, что Гутковский Игорь Николаевич руководитель как с более поздней датой, так и с более поздней датой актуальности.

### ООО "ИНТ Проекты" ОГРН 1047796140402 ОКПО 72049905

#### Учредители

```
ООО "ИНТ Проекты" / 3 учредителя физических лица

1.
доля 100%  10 000 руб. — с 14.04.2011 eaf от 17.02.2012
∅ доля 20%  10 000 руб. — с 04.04.2011 egrul от 09.02.2016
ГЕНЕРАЛЬНЫЙ ДИРЕКТОР — с 04.04.2011 rosstat от 29.02.2016
Чалый Александр Александрович

2.
доля 40%  20 000 руб. — с 04.04.2011 xegrul от 19.04.2011
∅ доля 50%  20 000 руб. — с 05.03.2004 xegrul от 02.12.2009
Ященко Наталья Юрьевна

3.
доля 40%  20 000 руб. — с 04.04.2011 xegrul от 19.04.2011
∅ доля 50%  20 000 руб. — с 05.03.2004 xegrul от 02.12.2009
∅ Генеральный директор — с 05.03.2004 xegrul от 02.12.2009
Ященко Вадим Викторович
```

Все учредители актуальные с общей долей > 100%, т.к. по поздним данным Селдона от 19.04.2011 учредители Ященко Наталья Юрьевна с 14.04.2011 доля 40% и Ященко Вадим Викторович с 14.04.2011 доля 40%, а по Архиву ЕГРЮЛ от 17.02.2012 -- даты более поздней, чем данные Селдона, учредитель Чалый Александр Александрович с 14.04.2011 доля 100%:

```
"Сырые данные"
ООО "ИНТ Проекты" / 3 учредителя физических лица

1.
доля 100%  10 000 руб. — с 14.04.2011 eaf от 17.02.2012
доля 20%  10 000 руб. — с 04.04.2011 egrul от 09.02.2016
...
Чалый Александр Александрович

2.
доля 40%  20 000 руб. — с 14.04.2011 xegrul от 19.04.2011
доля 40%  20 000 руб. — с 04.04.2011 xegrul от 07.04.2011
...
доля 50%  20 000 руб. — с 05.11.2009 xegrul от 02.12.2009
...
доля 50%  20 000 руб. — с 05.03.2004 xegrul от 18.06.2009
...
Ященко Наталья Юрьевна

3.
доля 40%  20 000 руб. — с 14.04.2011 xegrul от 19.04.2011
доля 40%  20 000 руб. — с 04.04.2011 xegrul от 06.04.2011
...
доля 50%  20 000 руб. — с 05.11.2009 xegrul от 02.12.2009
доля 50%  20 000 руб. — с 05.03.2004 xegrul от 28.02.2005
...
Ященко Вадим Викторович
```

Были "хитрые" переходы долей, возможно, что-то напутано с датами в источниках данных.

Реально ситуация такая:
* Ященко Наталья Юрьевна и Ященко Вадим Викторович бывшие учредители
* Чалый Александр Александрович актуальный учредитель с 20%
* 80% у общества


### ООО УК "ИНВЕСТСТРОЙКОМПЛЕКС" ОГРН 1035009579197 ОКПО 70443035

#### Учредители

```
ООО УК "ИНВЕСТСТРОЙКОМПЛЕКС" / 6 учредителей

2 учредителя физических лица

1.
доля 51%  5 100 руб. — с 26.02.2013 rosstat от 29.02.2016
Компания с ограниченной ответственностью "ДЖИ ЭЛ КА ПРОПЕРТИЗ ЛИМИТЕД" (КИПР)

2.
доля 51%  5 100 руб. — с 15.12.2009 xegrul от 06.02.2016
Каниболоцкий Виктор Васильевич

1 учредитель компания
доля 49%  4 900 руб. — с 05.08.2010 rosstat от 29.02.2016
∅ доля 50%  5 000 руб. — с 03.12.2007 xegrul от 26.01.2011
ООО "Огни за кольцевой"

--- История ---

3 учредителя физических лица

1.
∅ доля 51%  5 100 руб. — с 29.11.2012 xegrul от 05.12.2012
Краснянский Георгий Леонидович

2.
∅ доля 50%  5 000 руб. — с 24.12.2007 xegrul от 24.05.2011
Гульшин Андрей Александрович

3.
∅ доля 50%  5 000 руб. — с 03.12.2007 xegrul от 24.05.2011
∅ доля 100%  10 000 руб. — с 22.12.2003 xegrul от 15.11.2007
Карлин Александр Васильевич
```

3 актуальных учредителя с общей долей > 100%, т.к. Росстат дает "ДЖИ ЭЛ КА ПРОПЕРТИЗ ЛИМИТЕД" и ООО "Огни за кольцевой", и Селдон дает Каниболоцкий Виктор Васильевич и ООО "Огни за кольцевой":

```
"Сырые данные"
ООО УК "ИНВЕСТСТРОЙКОМПЛЕКС" / 6 учредителей

5 учредителей физических лиц

1.
доля 51%  5 100 руб. — с 17.02.2015 xegrul от 06.02.2016
доля 51%  5 100 руб. — с 05.08.2010 xegrul от 04.09.2012
доля 51%  5 100 руб. — с 15.12.2009 eaf от 31.08.2012
...
Каниболоцкий Виктор Васильевич

2.
доля 51%  5 100 руб. — с 26.02.2013 rosstat от 29.02.2016
Компания с ограниченной ответственностью "ДЖИ ЭЛ КА ПРОПЕРТИЗ ЛИМИТЕД" (КИПР)

3.
доля 51%  5 100 руб. — с 29.11.2012 xegrul от 05.12.2012
Краснянский Георгий Леонидович

4.
доля 50%  5 000 руб. — с 04.08.2010 xegrul от 24.05.2011
доля 50%  5 000 руб. — с 24.12.2007 xegrul от 26.01.2011
...
Гульшин Андрей Александрович

5.
доля 50%  5 000 руб. — с 24.12.2007 xegrul от 24.05.2011
доля 50%  5 000 руб. — с 03.12.2007 xegrul от 25.01.2008
доля 100%  10 000 руб. — с 22.12.2003 xegrul от 15.11.2007
...
Карлин Александр Васильевич

1 учредитель компания

доля 49%  4 900 руб. — с 11.08.2014 xegrul от 06.02.2016
доля 49%  4 900 руб. — с 05.11.2013 xegrul от 23.09.2014
доля 49%  4 900 руб. — с 26.02.2013 rosstat от 29.02.2016
доля 49%  4 900 руб. — с 16.03.2011 xegrul от 21.09.2013
доля 49%  4 900 руб. — с 05.08.2010 xegrul от 02.02.2011
доля 50%  5 000 руб. — с 03.12.2007 xegrul от 26.01.2011
...
ООО "Огни за кольцевой"
```

См. [Использование приоритета источника в зависимости от ОПФ]


## TODO

### Использование приоритета источника в зависимости от ОПФ

Использование приоритета источника в зависимости от ОПФ, например:
* для ЗАО, ПАО, АО, ФГУП, ОАО -- Росстат
* для ООО -- ЕГРЮЛ

может как дать улучшения актуальности в некоторых случаях:
* см. [ГБУ ДТСЗН ГОРОДА МОСКВЫ ОГРН 1037704003270 ОКПО 03171831] -- актуальным учредителем будет только Правительство Москвы
* см. [ФГАНУ НИИХП ОГРН 5077746432594 ОКПО 05747152] -- актуальным учредителем будет только ФАНО России
* см. [ООО УК "ИНВЕСТСТРОЙКОМПЛЕКС" ОГРН 1035009579197 ОКПО 70443035] -- актуальными учредителями будут только Каниболоцкий Виктор Васильевич и ООО "Огни за кольцевой"

так и не дать:
* см. [АО "РЕЕСТР" ОГРН 1027700047275 ОКПО 17771492] -- учредители из ЕГРЮЛ будут неактуальными

Также использование приоритета источника в зависимости от ОПФ может вызвать некоторое непонимание у пользователей: анализируя последние данные из Росстата (Исторический профиль или другие источники) и последнюю выписку ЕГРЮЛ, пользователи будут видеть учредителей и там, и там, следовательно, могут считать всех актуальными.
