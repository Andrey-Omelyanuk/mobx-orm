import "reflect-metadata"
// ------------------------------------------------------------------------------------------------
// Store

let store = {
	models: {},
	history: []
};


function history(model_name: string, property_key: string, old_value, new_value) {
	store.history.push([model_name, property_key, old_value, new_value]);
}

function fixModelInStore(model_name) {
	if (! store.models[model_name]) {
		store.models[model_name] = {fields: [], objects: {}};
	}
}

function getType(target, key){
	let type = Reflect.getMetadata("design:type", target, key);
	return type ? type.prototype.constructor.name : undefined;
}


// ------------------------------------------------------------------------------------------------
// Model

class Model {
	async save()   {
		let model_name = this.constructor.name;
		let id = Math.random().toString(36).substring(7);
		history(model_name, 'id', (<any>this).__data['id'], id);
		(<any>this).__data['id'] = id;
		store.models[model_name].objects[id] = this;
	}
	async delete() { (<any>this).id = undefined; }
	static filter (where?, orderBy? : string[], limit? : number, offset? : number) : any {
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
				history(model_name, field_key, obj.__data[field_key], new_value);
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
					history(model_name, field_key, obj.__data[key], new_obj.id);
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
