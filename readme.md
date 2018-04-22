
Все как в SQL
- таблицы/модели
- поля и relations
- транзакции

+ на все можно подписаться
- на изменения в таблице/списке
- на отдельные переменные объектов (но только те которые были объявлены в моделях,
на динамические переменные это не распростроняется)

Одиночки?

Сущьности
=========

Model:
- описание сущьности

Entry:
	данные полей храняться в __data с соответствующими полями

Relation:
- автоматическое связывание 

Field:
- валидация

Transaction:
- откат при ошибке
- группировка в иерархии

Query:
- сортированный список объектов
- самообновляемый на основании указанного фильтра
- может направлять запрос на api для предзагрузки данных

-------

Field - декоратор оборачивает свойство в getter и setter, и в __data храним значение.
Fields:
 - pk
 - field
 - foreign
 - one
 - many
 - many_to_many



--------------------
1. Определение структуры
2. Определение производных данных
	- создание объектов 
	- связывание состояний
3. query
4. transaction


Синхронизация с удаленным хранилищем
---

CRUD:
C - save on instance (if pk on exist)
R - Query
U - save on instance (if pk exist)
D - delete on instance (should exist pk)


async Query.loadAll()
async Query.loadPage(N)   	- так же устанавливает текущую страницу в N
async Query.loadNextPage()
async Query.loadPrevPage()


users.loadAll()
users.loadPage(N)

все в одном!

subscribe
---

before - it is means action not started yet and you can interrupt it
after  - action was done and you can only react on it

Примеры использования подписки на события
User.subscribe.create.after  (callback)
User.subscribe.create.before (callback)
User.subscribe.delete.after  (callback)
User.subscribe.delete.before (callback)
User.subscribe.update.after	 (callback)
User.subscribe.update.before (callback)

user.subscribe.delete.before (callback)
user.subscribe.delete.after  (callback)
user.subscribe.update.before (callback)
user.subscribe.update.after  (callback)

user.subscribe.property.before('property name', callback)
user.subscribe.property.after ('property name', callback)
