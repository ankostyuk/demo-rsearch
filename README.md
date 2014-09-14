# rsearch

> Набор компонентов унифицированного поиска

## Окружение

* node.js 0.10.x+
* npm 1.3.x+
* grunt-cli `npm install grunt-cli -g`
* bower `npm install bower -g`


## Инициализация

Установка зависимостей проекта, зависимостей модуля

    npm install
    grunt init


## Проверка кода

    grunt jshint


## i18n

Сбор ключей перевода, формирование бандлов перевода

[nullpointer-i18n-bin/docs/build.md](http://repo.nkb/git/gitweb.cgi?p=nullpointer/i18n-bin.git;a=blob;f=README.md;h=e6f088c99ed5f43a0ae12ef133f9befaba117268;hb=refs/heads/master)

    grunt i18n


## Сборка

Установка зависимостей модуля, проверка кода, оптимизация, дистрибутивы

    grunt build

### Файлы дистрибутивов

#### nkb-app

Приложение для интеграции в старый сайт НКБ

[Дистрибутив](dist/nkb-app)

## Очистка

Удаление зависимостей проекта

    grunt clean:deps

Удаление сборки

    grunt clean:target
