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


##Проверка кода

    grunt jshint


##Сборка

Установка зависимостей модуля, проверка кода, оптимизация

    grunt build


##Дистрибутив

Копирование оптимизированных файлов

    grunt dist


##Очистка

Удаление зависимостей проекта, зависимостей модуля, сборки

    grunt clean:deps

Удаление зависимостей модуля

    grunt clean:src

Удаление сборки

    grunt clean:target
