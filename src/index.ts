import "reflect-metadata"



/*
Все как в SQL
- таблицы/модели
- поля и relations
- транзакции

+ на все можно подписаться
- на изменения в таблице/списке
- на отдельные переменные объектов (но только те которые были объявлены в моделях,
на динамические переменные это не распростроняется)

Одиночки?

Сущьности:

Model:

Entry:

Field:

Transaction:

Query:
	- сортированный список объектов
	- самообновляемый на основании указанного фильтра
	- может направлять запрос на api для предзагрузки данных

 */






// ------------------------------------------------------------------------------------------------
// Store

let store = {
	history: {
		// <model_name>: {
		//    <id>: Map(<transaction>,<new_changes>)
		// }
	},
	objects: {					// all objects
		// <model_name>: {
		//    <id>: {<object>}
		// }
	},
	models: {
		// <model_name>: {
		// 	  fileds: { <field_name>: <type>???},
		// }
	},
	transactions: {
		history	: [],		  // all history transactions
		root		: null,		// root of current transaction
		current	: null		// current transaction
	},
	dependencies: {

	}
};


function history(model_name: string, id, prev_state, new_changes) {
	let transaction_current = store.transactions.current;

	if (!store.history[model_name]    ) { store.history[model_name] = {}; }
	if (!store.history[model_name][id]) { store.history[model_name][id] = new Map(); }
	let history = store.history[model_name][id];

	// История может вестись только в контексте транзакции.
	if (transaction_current == null) { throw new Error(`You cannot change data without transaction.`); }


	// Вычисляем суммарные изменения в этой транзакции
	let current = null;
	if (history.size) {
		let history_prev = Array.from(history.entries()).pop();
		// предыдущая история это все еще наша транзакция? тогда делаем merge в предыдущею историю
		if (history_prev[0] === transaction_current) { current = Object.assign(history_prev[1], new_changes); }
		// предыдущея история из другой транзакции
		else { current = new_changes; }
	}
	else { current = new_changes; }

	// В current должны находиться суммарные изменения по транзакции
	history.set(transaction_current, current);

	// сохраняем историю в самой транзакции
	if (!transaction_current.history[model_name]        ) { transaction_current.history[model_name]         = {}; }
	if (!transaction_current.history[model_name][id]    ) { transaction_current.history[model_name][id]     = {old: null, new: null}; }
	if (!transaction_current.history[model_name][id].old) { transaction_current.history[model_name][id].old = prev_state; }
	transaction_current.history[model_name][id].new = current;
}

function fixModelInStore(model_name) {
	if (! store.models[model_name]) {
		store.models[model_name] = {fields: []};
	}
}

function getType(target, key){
	let type = Reflect.getMetadata("design:type", target, key);
	return type ? type.prototype.constructor.name : undefined;
}


// ------------------------------------------------------------------------------------------------
// Transaction

class Transaction {
	private name;
	private children: Transaction[] = [];
	private parent: Transaction = null;
	// history = {
	//    <class>: {
	//      <id>: {old: <old_state>, new: <new_changes> }
	// }
	public  history = {};

	constructor(name?: string) {
		this.name = name;
		this.parent = store.transactions.current;
		if (this.parent == null) { store.transactions.history.push(this); }
		else                     { this.parent.children.push(this);	}
		store.transactions.current = this;
	}

	public commit() {
		// выполнение события transaction_commit на каждом объекте который изменился во время транзакции
		for (let cls_name in this.history) {
			for (let obj of this.history[cls_name]) {
				obj.transaction_commit();
			}
		}
		store.transactions.current = this.parent;
	}

	public rollback() {
		// откатываем изменения по истории что была на этой транзакции
	}

	public checkpoint() {
		// все что успели сделать, оборачиваем в новую транзакцию и делаем commit для этой новой транзакции
	}
}


function transaction() {

}

// ------------------------------------------------------------------------------------------------
// Model

class Model {

	async save()   {
		let t = new Transaction('save');
		let model_name = this.constructor.name;
		let id = Math.random().toString(36).substring(7);
		(<any>this).__data['id'] = id;
		if(!store.objects[model_name]    ) { store.objects[model_name] = {}; }
		if(!store.objects[model_name][id]) { store.objects[model_name][id] = {}; }
		store.objects[model_name][id] = this;
		history(model_name, id, null, (<any>this).__data);
		t.commit();
	}
	async delete() { (<any>this).id = undefined; }
	static filter (where?, orderBy? : string[], limit? : number, offset? : number) : any {
	}

	public transaction_commit() {
		// транзакция почти завершина, этот this объект уставствовал в ней
		// и если нужно как то на это отреагировать, то реагировать нужно сдесь
		// например отправить запрос на сервер
	}
}

function registerModel(cls: Function) {
	// Decorate class for:
	// 1. add __data for store original values
	// 2. Wrap fields of object

	// the new constructor behaviour
	let f : any = function (...args) {
		let c : any = function () { return cls.apply(this, args); };
		c.prototype = cls.prototype;
		let obj = new c();

		obj.__data = {};
		for (let field_wrapper of store.models[cls.name].fields) { field_wrapper(obj); }

		return obj;
	};

	f.prototype = cls.prototype;   // copy prototype so intanceof operator still works
	return f;                      // return new constructor (will override original)
}

// ------------------------------------------------------------------------------------------------
// Fields
//
// id             - only read, save() method should setup this field
// field          -
// key            - only read, can be setup using according foreign field
// foreign        -
//
// one            -
// many           -
// many_to_many   -



function id(cls: any, field_key: string) {
	let model_name = cls.constructor.name;
	fixModelInStore(model_name);
	store.models[model_name].fields.push((obj) => {
		obj.__data[field_key] = obj[field_key];
		Object.defineProperty (obj, field_key, {
			get: () => obj.__data[field_key],
			set: (new_value) => { throw new Error(`You cannot change id.`) }
		});
	});
}


function field(cls: any, field_key: string) {
	let model_name = cls.constructor.name;
	fixModelInStore(model_name);
	store.models[model_name].fields.push((obj) => {
		obj.__data[field_key] = obj[field_key];
		Object.defineProperty (obj, field_key, {
			get: () => obj.__data[field_key],
			set: (new_value) => {
				let old_values = {}; old_values[field_key] = obj.__data[field_key];
				let new_values = {}; new_values[field_key] = new_value;
				history(model_name, obj.__data.id, old_values, new_values );
				obj.__data[field_key] = new_value;
			}
		});
	})
}


function key(cls: any, field_key: string) {
	let model_name = cls.constructor.name;
	fixModelInStore(model_name);
	store.models[model_name].fields.push((obj) => {
		obj.__data[field_key] = obj[field_key];
		Object.defineProperty (obj, field_key, {
			get: (         ) =>   obj.__data[field_key],
			set: (new_value) => { throw new Error(`Your cannot set key manually, use foreign filed instead`); }
		});
	})
}

function foreign(key?: string) {
	return function (cls: any, field_key: string) {
		if (!key) { key = `${field_key}_id`; }
		let type = getType(cls, field_key);
		let model_name = cls.constructor.name;
		fixModelInStore(model_name);
		store.models[model_name].fields.push((obj) => {
			if(obj[field_key]) {
				obj.__data[key] = obj[field_key].id;
			}
			Object.defineProperty (obj, field_key, {
				get: () => {
					if (!type) {
						type = getType(cls, field_key);
					}
					let model = store.models[type];
					let id = obj.__data[key];
					return (model && id) ? model.objects[id] : undefined;
				},
				set: (new_obj) => {
					if (new_obj.constructor.name != type) {
						throw new Error(`You can set only instance of "${type}"`);
					}
					if (!new_obj.id) {
						throw new Error(`Your instance should have id`);
					}
					history(model_name, obj.__data.id, ({}[field_key] = obj.__data[key]), ({}[field_key] = new_obj.id) );
					obj.__data[key] = new_obj.id;
				}
			});
		})
	}
}


function one(cls: any, field_key: string) {
	fixModelInStore(cls.constructor.name);
	store.models[cls.constructor.name].fields.push((obj) => {
		obj.__data[field_key] = obj[field_key];
		Object.defineProperty (obj, field_key, {
			get: (         ) =>   obj.__data[field_key],
			set: (new_value) => { obj.__data[field_key] = new_value; }
		});
	})
}

function many(cls: any, field_key: string) {
	fixModelInStore(cls.constructor.name);
	store.models[cls.constructor.name].fields.push((obj) => {
		obj.__data[field_key] = obj[field_key];
		Object.defineProperty (obj, field_key, {
			get: (         ) =>   obj.__data[field_key],
			set: (new_value) => { obj.__data[field_key] = new_value; }
		});
	})
}

function many_to_many(cls: any, field_key: string) {
	fixModelInStore(cls.constructor.name);
	store.models[cls.constructor.name].fields.push((obj) => {
		obj.__data[field_key] = obj[field_key];
		Object.defineProperty (obj, field_key, {
			get: (         ) =>   obj.__data[field_key],
			set: (new_value) => { obj.__data[field_key] = new_value; }
		});
	})
}





// ------------------------------------------------------------------------------------------------
// Query

class Query {
	constructor(model, where?, orderBy? : string[], limit? : number, offset? : number ) {
	}
}

// ---------------------------------------------------------------------------------------------------
// declare models

@registerModel
class Skill extends Model {
	@id     id    : number;
	@field  name  : string;

	@many_to_many users  : User[];

	constructor (name?) {
		super();
		this.name = name;
	}
}

@registerModel
class UserSkill extends Model {
	@id       id        : number;
	@key      user_id   : number;
	@key      skill_id  : number;

	@foreign() user : User;
	@foreign() skill: Skill;
}

@registerModel
class User extends Model {
	@id       id            : number;
	@field    first_name    : string;
	@field    second_name   : string;

	@one          profile   : UserProfile;
	@many_to_many skills    : Skill[];

	get fullname() { return `${this.first_name} ${this.second_name}`; };

	constructor(first_name, second_name) {
		// тут я это не просто так сделал!
		super();
		this.first_name = first_name;
		this.second_name = second_name;
	}
}

@registerModel
class UserProfile extends Model {
	@id       id          : number;
	@key      user_id     : number;
	@field    location    : string;

	@foreign() user: User;

	constructor(user, location) {
		super();
		this.user = user;
		this.location = location;
	}
}


// -------------------------------------------------------------------------------------------------------
// test cases

let skillA  = new Skill('A'); skillA.save();
let skillB  = new Skill('B'); skillB.save();
let user    = new User('first', 'second'); user.save();
let profile = new UserProfile(user, 'X'); profile.save();

// user.skills.push(skillA, skillB);
console.log(skillA.id);
console.log("store", store);


// let users_all: User[] = User.filter((user) => {
//   return user.profile.location == 'A'
// });

// let profiles_with_skill_a : UserProfile[] = UserProfile.filter((profile) => {
//   return profile.user.skills.name == 'A'
// });



import Vue from 'vue'

new Vue({
	el: '#app',
	data: function () {
		return {
			user:  user,
		};
	},
	methods: {
		test: function () {
			let t = new Transaction('first name');
			this.user.first_name = this.user.first_name + 'test';
			t.commit();
		},
		storePrint: function () {
			console.log(store);
		}
	}
});
