/*
Note: ни каких составных ключей! в жопу их, они все только усложняют и это плохая практика!

Структура данных хранилища:
store
	models
		<model_name>
			objects		- <id>: {<object>} - ВСЕ объекты модели
			pk				- id поле, он же primary key
			fields		- <field name>: function(obj)  функция которая оборачивает в getter и setter БАЗОВЫЕ поля такие как: pk, key, field
			relations - на кого мы завязаны, регистрируеться в foreign
				<local field>: <model_name>
			related		- кто на нас завязан, регистрируеться в many и one
				<local field>: { model_name: <model_name>, field: <field> }
			getNewId()- используеться для генерации локальных id
			subscriptions - подписки на изменения
				before_create
				before_update
				before_delete
				after_create
				after_update
				after_delete

Функции хранилища:
	Note: all functions return nothing, you can catch errors in exception

	model 								(cls) - декоратор для класса, который мы хотим зарегистрировать как модель
	registerModel 				(model_name) - register model in store if not registered yet
	registerModelPk				(model_name, fieldKey)	-
	registerModelField 		(model_name, fieldKey, fieldWrapper) 				-
	registerModelRelation	(modelA_name, fieldA, modelB_name)					-
	registerModelRelated	(modelA_name, fieldA, modelB_name, fieldB) 	-
*/

class Store {
	models : any = {}

	model = (cls) => {
		// Decorate class for:
		// 1. add __data for store original values
		// 2. Wrap fields of object
		// 3. generate 'local' id for object
		// 4. add new object to objects of model

		let _store = this
		// the new constructor behaviour
		let f : any = function (...args) {
			let c : any = function () { return cls.apply(this, args) }
			c.prototype = cls.__proto__
			c.prototype = cls.prototype

			let obj = new c()
			let model_desc = _store.models[cls.name]
			let id = '#'+model_desc.getNewId()

			obj.__data = {}
			for (let key in model_desc.fields) { model_desc.fields[key](obj) }
			obj.__data[model_desc.pk] = id
			model_desc.objects[id] = obj
			return obj
		}

		f.__proto__ = cls.__proto__
		f.prototype = cls.prototype   // copy prototype so intanceof operator still works
		return f                      // return new constructor (will override original)
	}

	registerModel(model_name) {
		if (!this.models[model_name]) {
			let _count = 0
			this.models[model_name] = {
				objects		: {},
				pk				: null,
				fields		: {},
				relations	: {},
				related		: {},
				getNewId: () => {
					_count = _count + 1
					return _count
				},
				subscriptions: {
					before_create: [],
					before_update: [],
					before_delete: [],
					after_create: [],
					after_update: [],
					after_delete: []
				}
			}
		}
	}

	registerModelPk(model_name, fieldKey) {
		this.registerModel(model_name)
		this.models[model_name].pk = fieldKey
	}

	registerModelField(model_name, fieldKey, fieldWrapper) {
		this.registerModel(model_name)
		if (!this.models[model_name].fields[fieldKey]) {
			this.models[model_name].fields[fieldKey] = fieldWrapper
		}
		else {
			throw 'Field already registered.'
		}
	}

	registerModelRelation(modelA_name, fieldA, modelB_name) {
		this.registerModel(modelA_name)

		if (!this.models[modelA_name].relations[fieldA])
			this.models[modelA_name].relations[fieldA] = modelB_name
		else
			throw 'Relation already registered.'
	}

	registerModelRelated(modelA_name, fieldA, modelB_name, fieldB) {
		this.registerModel(modelA_name)
		this.registerModel(modelB_name)

		if (!this.models[modelA_name].related[fieldA])
			this.models[modelA_name].related[fieldA] = {model_name: modelB_name, field: fieldB}
		else
			throw 'Related already registered.'
	}
	/*
		before - it is means action not started yet and you can interrupt it
		after  - action was done and you can only react on it

		Примеры использования подписки на события
		store.subscribe.create.after  (cls, callback)
		store.subscribe.create.before (cls, callback)
		store.subscribe.delete.after  (cls, callback)
		store.subscribe.delete.before (cls, callback)
		store.subscribe.update.after	(cls, callback)
		store.subscribe.update.before (cls, callback)
	 */
	subscribe = {
		create: {
			before: (model_name, callback)=> { return this._subscribeTo(model_name, 'before_create', callback) },
			after : (model_name, callback)=> { return this._subscribeTo(model_name, 'after_create' , callback) },
		},
		update: {
			before: (model_name, callback)=> { return this._subscribeTo(model_name, 'before_update', callback) },
			after : (model_name, callback)=> { return this._subscribeTo(model_name, 'after_update' , callback) },
		},
		delete: {
			before: (model_name, callback)=> { return this._subscribeTo(model_name, 'before_delete', callback) },
			after : (model_name, callback)=> { return this._subscribeTo(model_name, 'after_delete' , callback) }
		}
	}

	private _subscribeTo(model_name, to, callback) {
		let subscriptions = this.models[model_name].subscriptions[to]
		subscriptions.push(callback)
		let index = subscriptions.length - 1
		return () => {
			delete subscriptions[index]
		}
	}
}

let store = new Store()
export default store
