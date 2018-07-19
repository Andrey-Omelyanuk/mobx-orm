
Все возможные события


store 	- inject
				- eject
				
Note: Store have events "inject/eject" for each model.
Note: Model have no events! "Create" event is not make sense.

object 	- update

field 	- update

filter  - add
				- remove
				- reorder
				- update
				
Event   - это много раз повторяющиеся события, например inject в store
Promise - это ТОЛЬКО РАЗ выполненное/завершенное действие, оно ни как ни может повториться, например create или delete!
Ты ведь не думаешь что один и тот же объект можно создать/удалить дважды?

Особый режим загрузки/выгрузки для store.
Для фронтенда любой inject/eject (не в состоянии режима загрузки!)
это равносильно create/delete! 

Если хочеться подписаться на удаление объекта, то подписывайся на eject в моделе! И там уже жди свой объект.
Не надо усложнять дополнительным subscribe.delete на объекте.


