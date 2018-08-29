Event   - это много раз повторяющиеся события, например inject в store
Promise - это ТОЛЬКО РАЗ выполненное/завершенное действие, оно ни как не может повториться, например create или delete!
Ты ведь не думаешь что один и тот же объект можно создать/удалить дважды?

-----------------------
Все возможные события

1. store
	- inject
	- eject

store.onEject(function(obj) {...})

2. model
  - inject
  - eject 
  
User.onEject(function(user) {...})
store.onEject('<model_name>', function(obj) {...})

  
3. object
  - update
  - delete
user.onUpdate(function(user) {...})
user.onDelete(function(user) {...})
  
Note: внутри delete мы используем Promise! т.к. это событие все равно произойдет только один раз!
Note: нет смысла в create событии, т.к. ни как нельзя подписаться на объект который еще не существует!
но можно следить за store.inject
  
4. field
  - update
user.onUpdateField(<field_name>, function(user, field) {...})
  
5. filter
  - add
  - remove 
  - update  
