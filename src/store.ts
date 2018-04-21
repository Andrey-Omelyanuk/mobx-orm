/*
  Everything you can find in store.
 */

/*
Структура данных хранилища:

store
	models
		objects		- <id>: {<object>}
		fields		- <field name>: function(obj)  функция которая оборачивает в getter и setter БАЗОВЫЕ поля такие как: pk, key, field
		relations ???
		computed  ???
	transactions
		current
		history

Функции хранилища:
	Note: all functions return nothing, you can catch errors in exception

	model 										 (cls) -
	registerModel 						 (cls) - register model in store if not registered yet
	registerModelPk						 (cls, fieldKey)	-
	registerModelField 				 (cls, fieldKey, fieldWrapper) -
	registerModelComputedField (cls, fieldKey, fieldWrapper) -

*/

let store = {
	// зарегистрированные модели
	// тут храниться вся структура данных, с которыми мы работаем
	// Note: ни каких составных ключей! в жопу их, они все только усложняют и это плохая практика!
	models: {
		// <model name>: {
		//    pk: <field name>,
		//		keys: {
		//			<local field name>: { model: model, fieldKey: field }
		//		},
		//		//
		//		// все ПРОИЗВОДНЫЕ поля от БАЗОВЫХ такие как foreignObject, one, many, manyToMany, computed
		//		computed: {
		//			<field name>: function(obj) // функция которая оборачивает в getter и setter
		//		}
		// }
	},
  history: {
    // <model name>: {
    //    <id>: Map(<transaction>,<new changes>)
    // }
  },
	// тут храняться все объекты моделей
  objects: {
    // <model name>: {
    //    <id>: {<object>}
    // }
  },

	model: (cls) => {
		// Decorate class for:
		// 1. add __data for store original values
		// 2. Wrap fields of object

		// the new constructor behaviour
		let f : any = function (...args) {
			let c : any = function () { return cls.apply(this, args) }
			c.prototype = cls.prototype
			let obj = new c()

			obj.__data = {}
			for (let fieldWrapper of store.models[cls.name].fields) { fieldWrapper(obj) }

			return obj
		}

		f.prototype = cls.prototype   // copy prototype so intanceof operator still works
		return f                      // return new constructor (will override original)
	},


	registerModel: (cls) => {
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
		if (!store.models[model_name]) {
			store.models[model_name] = {}
		}
	},

	//
	registerModelPk: (cls, fieldKey) => {
		store.registerModel(cls)
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
		let model = store.models[model_name]
		store.models[cls.constructor.name].pk = fieldKey
	},

	//
	registerModelRelation: (modelA, fieldA, modelB, fieldB='id') => {
		store.registerModel(modelA)
		store.registerModel(modelB)
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let modelA_name = modelA.constructor.name == "Function" ? modelA.prototype.constructor.name : modelA.constructor.name
		if (!store.models[modelA_name].keys) {
			store.models[modelA_name].keys = {}
		}
		if (!store.models[modelA_name].keys[fieldA]) {
			// It can be wrong name "Function" because we wrapped class in decorator before.
			let modelB_name =  modelB.constructor.name == "Function" ? modelB.prototype.constructor.name : modelB.constructor.name
			store.models[modelA_name].keys[fieldA] = {model: modelB_name, fieldKey: fieldB}
		}
		else {
			throw 'Key already registered.'
		}
	},

	//
	registerModelField: (cls, fieldKey, fieldWrapper) => {
		store.registerModel(cls)
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
		if(!store.models[model_name].fields){
			store.models[model_name].fields = {}
		}
		if (!store.models[model_name].fields[fieldKey]) {
			store.models[model_name].fields[fieldKey] = fieldWrapper
		}
		else {
			throw 'Field already registered.'
		}
	},

	registerModelComputedField: (cls, fieldKey, fieldWrapper) => {
		store.registerModel(cls)
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name
		if(!store.models[model_name].computed){
			store.models[model_name].computed = {}
		}
		if (!store.models[model_name].computed[fieldKey]) {
			store.models[model_name].computed[fieldKey] = fieldWrapper
		}
		else {
			throw 'Field already registered.'
		}
	}
}

export default store

