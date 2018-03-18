/*
  Everything you can find in store.
 */

let store = {
	// зарегистрированные модели
	// тут храниться вся структура данных, с которыми мы работаем
	models: {
		// <model_name>: {
		//    pk: <field key> or [<field key>, ...] for composite primary key,
		//		keys: {
		//			<local field key>: { model: model, fieldKey: field }
		//		},
		// 	  fields: {
		//			тут находяться все поля на которых были установленны декораторы
		//			т.е. все pk, key, field, one, many etc должны быть тут
		//			это информация используеться во время создания объекта что бы обернуть поля в getter/setter
		//			формат хранения:
		//      <field name>: function(obj) // функция которая оборачивает в getter и setter
		//    }
		// }
	},
  history: {
    // <model name>: {
    //    <id>: Map(<transaction>,<new_changes>)
    // }
  },
  objects: {					// all objects
    // <model name>: {
    //    <id>: {<object>}
    // }
  },
  transactions: {
    history	: [],		  // all history transactions
    root		: null,		// root of current transaction
    current	: null		// current transaction
  },
	// ???? для чего это нам???
  dependencies: {

  },

	model: (cls) => {
		// Decorate class for:
		// 1. add __data for store original values
		// 2. Wrap fields of object

		// the new constructor behaviour
		let f : any = function (...args) {
			let c : any = function () { return cls.apply(this, args); };
			c.prototype = cls.prototype;
			let obj = new c();

			obj.__data = {};
			for (let fieldWrapper of store.models[cls.name].fields) { fieldWrapper(obj); }

			return obj;
		};

		f.prototype = cls.prototype;   // copy prototype so intanceof operator still works
		return f;                      // return new constructor (will override original)
	},

	// register model in store if not registered yet
	registerModel: (cls) => {
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name;
		if (!store.models[model_name]) {
			store.models[model_name] = {
				pk			: null,
				keys		: {},
				fields	: {}
			}
		}
	},

	//
	registerModelPk: (cls, fieldKey) => {
		store.registerModel(cls);
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name;
		let model = store.models[model_name];
		if (model.pk) {	// case for composite pk
			if (Array.isArray(model.pk)) 	model.pk.push(fieldKey);
			else													model.pk = [model.pk, fieldKey];
		}
		else {
			store.models[cls.constructor.name].pk = fieldKey;
		}
	},

	//
	registerModelField: (cls, fieldKey, fieldWrapper) => {
		store.registerModel(cls);
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let model_name = cls.constructor.name == "Function" ? cls.prototype.constructor.name : cls.constructor.name;
		if (!store.models[model_name].fields[fieldKey]) {
			store.models[model_name].fields[fieldKey] = fieldWrapper;
		}
		else {
			throw 'Field already registered.'
		}
	},

	//
	registerModelRelation: (modelA, fieldA, modelB, fieldB='id') => {
		store.registerModel(modelA);
		store.registerModel(modelB);
		// It can be wrong name "Function" because we wrapped class in decorator before.
		let modelA_name = modelA.constructor.name == "Function" ? modelA.prototype.constructor.name : modelA.constructor.name;
		if (!store.models[modelA_name].keys[fieldA]) {
			// It can be wrong name "Function" because we wrapped class in decorator before.
			let modelB_name =  modelB.constructor.name == "Function" ? modelB.prototype.constructor.name : modelB.constructor.name;
			store.models[modelA_name].keys[fieldA] = {model: modelB_name, fieldKey: fieldB};
		}
		else {
			throw 'Key already registered.'
		}

	}
};

export default store;

