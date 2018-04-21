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
			related		- кто на нас завязан, регистрируеться в many и one
			getNewId()- используеться для генерации локальных id

Функции хранилища:
	Note: all functions return nothing, you can catch errors in exception

	model 										 (cls) - декоратор для класса, который мы хотим зарегистрировать как модель
	registerModel 						 (cls) - register model in store if not registered yet
	registerModelPk						 (cls, fieldKey)	-
	registerModelField 				 (cls, fieldKey, fieldWrapper) -

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
			c.prototype = cls.prototype
			let obj = new c()

			obj.__data = {}

			for (let key in _store.models[cls.name].fields) {
				_store.models[cls.name].fields[key](obj)
			}
			if (!_store.models[cls.name].objects){
				_store.models[cls.name].objects = {}
			}
			let id = _store.models[cls.name].getNewId()
			obj.__data[_store.models[cls.name].pk] = id
			_store.models[cls.name].objects[id] = obj
			return obj
		}

		f.prototype = cls.prototype   // copy prototype so intanceof operator still works
		return f                      // return new constructor (will override original)
	}

	registerModel(cls) {
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
		if (!this.models[model_name]) {
			let _count = 0
			this.models[model_name] = {
				getNewId: () => {
					_count = _count + 1
					return _count
				}
			}
		}
	}

	registerModelPk(cls, fieldKey) {
		this.registerModel(cls)
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
		this.models[model_name].pk = fieldKey
	}

	registerModelField(cls, fieldKey, fieldWrapper) {
		this.registerModel(cls)
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
		if(!this.models[model_name].fields){
			this.models[model_name].fields = {}
		}
		if (!this.models[model_name].fields[fieldKey]) {
			this.models[model_name].fields[fieldKey] = fieldWrapper
		}
		else {
			throw 'Field already registered.'
		}
	}

	registerModelRelation(modelA, fieldA, modelB, fieldB='id') {
		this.registerModel(modelA)
		this.registerModel(modelB)
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let modelA_name = modelA.constructor.name == "Function" ? modelA.prototype.constructor.name : modelA.constructor.name
		if (!this.models[modelA_name].keys) {
			this.models[modelA_name].keys = {}
		}
		if (!this.models[modelA_name].keys[fieldA]) {
			// It can be wrong name "Function" because we wrapped class in decorator before.
			let modelB_name =  modelB.constructor.name == "Function" ? modelB.prototype.constructor.name : modelB.constructor.name
			this.models[modelA_name].keys[fieldA] = {model: modelB_name, fieldKey: fieldB}
		}
		else {
			throw 'Key already registered.'
		}
	}

	registerModelRelated(modelA, fieldA, modelB, fieldB='id') {
		this.registerModel(modelA)
		this.registerModel(modelB)
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let modelA_name = modelA.constructor.name == "Function" ? modelA.prototype.constructor.name : modelA.constructor.name
		if (!this.models[modelA_name].keys) {
			this.models[modelA_name].keys = {}
		}
		if (!this.models[modelA_name].keys[fieldA]) {
			// It can be wrong name "Function" because we wrapped class in decorator before.
			let modelB_name =  modelB.constructor.name == "Function" ? modelB.prototype.constructor.name : modelB.constructor.name
			this.models[modelA_name].keys[fieldA] = {model: modelB_name, fieldKey: fieldB}
		}
		else {
			throw 'Key already registered.'
		}
	}
}

let store = new Store()
export default store

