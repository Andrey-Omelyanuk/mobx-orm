
let store = {
	models: {

	}
};

// ------------------------------------------------------------------------------------------------
// Model

class Model {
	async save()   { (<any>this).id = Math.random().toString(36).substring(7); }
	async delete() { (<any>this).id = undefined; }
	static filter (where?, orderBy? : string[], limit? : number, offset? : number) : any {

	}
}

function registerModel(target: any) {
	// 1. Register model in store
	// 2. Wrap fields of model using Field.setup

	// the new constructor behaviour
	let f : any = function (...args) {
		let c : any = function () { return target.apply(this, args); };
		c.prototype = target.prototype;
		let obj = new c();

		// 2. Wrap fields of model using Field.setup
		obj.__data = {};
		for (let field_name of Object.getOwnPropertyNames(obj)) {
			if (obj[field_name] instanceof Field) {
				obj[field_name].setup(obj, field_name);
			}
		}
		return obj;
	};
	// 1. Register model in store
	if (target.name in store.models) { throw new Error('Model already registered!'); }
	store.models[target.name] = {};

	f.prototype = target.prototype;   // copy prototype so intanceof operator still works
	return f;                         // return new constructor (will override original)
}

// ------------------------------------------------------------------------------------------------
// Fields

class Field {
	setup(obj, field_name) {}
}

class FieldPrimaryKey extends Field {
	setup(obj, id_field_name) {
		Object.defineProperty (obj, id_field_name, {
			get: function () {
				return obj.__data[id_field_name];
			},
			set: function (new_id) {
				if (store.models[obj.constructor.name][new_id]) {
					throw new Error(`Object ${obj.constructor.name} with id ${new_id} already exist.`);
				}
				obj.__data[id_field_name] = new_id;
				store.models[obj.constructor.name][new_id] = obj;
			}
		});
	}
}

class FieldForeignKey extends Field {
	model_name: string;
	name_of_id: string;
	setup(obj, field_name) {
		if (!this.name_of_id) {
			this.name_of_id = field_name+'_id';
		}
		Object.defineProperty (obj, field_name, {
			get: () => {
				debugger;
				if (store.models[this.model_name] && obj.__data[this.name_of_id]){
					return store.models[this.model_name][obj.__data[this.name_of_id]];
				}
				return undefined;
			},
			set: (new_obj) => {
				if (new_obj.constructor.name != this.model_name) {
					throw new Error(`You can set only instance of "${new_obj.constructor.name}"`);
				}
				if (!new_obj.id) {
					throw new Error(`Your instance should have id`);
				}
				obj.__data[this.name_of_id] = new_obj.id;
			}
		})
	}

	constructor(model_name: string, name_of_id? : string){
		super();
		this.model_name = model_name;
		this.name_of_id = name_of_id;
	}
}

class FieldString extends Field {
	setup(obj, id_field_name) {
		Object.defineProperty (obj, id_field_name, {
			get: function () {
				return obj.__data[id_field_name];
			},
			set: function (new_string) {
				obj.__data[id_field_name] = new_string;
			}
		})
	}
}

class FieldNumber extends Field {
	setup(obj, id_field_name) {
		Object.defineProperty (obj, id_field_name, {
			get: function () {
				return obj.__data[id_field_name];
			},
			set: function (new_number) {
				obj.__data[id_field_name] = new_number;
			}
		})
	}
}


namespace F {
	export function ID() : any { return new FieldPrimaryKey }
	export function String()     : any { return new FieldString     }
	export function Number()     : any { return new FieldNumber     }
	export function Computed(getter, setter?) : any {}
	export function Foreign(model, foreign_field_id?) : any {
		return new FieldForeignKey(model.prototype.constructor.name, foreign_field_id)
	}
	export function ManyToMany(model, throughModel) : any {}
	export function OneToOne(config) : any {}
	export function Relation(model, field_name) : any {}
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
	id     : number = F.ID();
	users  : User[] = F.ManyToMany(User, UserSkill);
	name   : string = String();
}

@registerModel
class UserSkill extends Model {
	id      : number = F.ID();
	user    : User   = F.Foreign(User);
	skill   : Skill  = F.Foreign(Skill);
}

@registerModel
class User extends Model {
	id          : number = F.ID();
	first_name   : string = F.String();
	second_name  : string = F.String();

	skills    : Skill[]     = F.ManyToMany(Skill, UserSkill);
	profile   : UserProfile = F.Relation(UserProfile, 'user');

	get fullname() { return `${this.first_name} ${this.second_name}`; };
}

@registerModel
class UserProfile extends Model {
	id          : number = F.ID();
	user        : User   = F.Foreign(User, 'user_id');
	location    : string = F.String();

	// Don't use constructor for init property! it is js problem :(
	// constructor(user, location) {
	// 	super();
	// 	debugger;
	// 	this.user = user;
	// 	this.location = location;
	// }
}


// -------------------------------------------------------------------------------------------------------
// test cases

let skillA  = new Skill(); skillA.name = 'A'; skillA.save();
let skillB  = new Skill(); skillB.name = 'B'; skillB.save();
let user    = new User(); user.first_name = 'first'; user.second_name = 'second'; user.save();
let profile = new UserProfile(); profile.user = user; profile.location = 'X'; profile.save();

// user.skills.push(skillA, skillB);

console.log("store", store);


// let users_all: User[] = User.filter((user) => {
//   return user.profile.location == 'A'
// });

// let profiles_with_skill_a : UserProfile[] = UserProfile.filter((profile) => {
//   return profile.user.skills.name == 'A'
// });
