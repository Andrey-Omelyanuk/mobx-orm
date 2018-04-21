
export default class Model {


	/*
		Create - create new object   (call save() for object that have no id)
		Update - update exist object (call save() for object that have id)
		Delete - delete object       (call delete() for object)
		Inject - object added   to   local cache (for example when we read data from server)
		Eject  - object removed from local cache (for example when we clear the cache when logout)

		before - it is means action not started yet and you can interrupt it
		after  - action was done and you can only react on it

		Examples:

		let obj = Obj()
		obj.save() 		// beforeCreate, beforeInject, afterInject, afterCreate
									// id was added to obj
		obj.save() 		// beforeUpdate, beforeInject, afterInject, afterUpdate
		obj.delete()	// beforeDelete, beforeEject , afterEject , afterDelete

	*/
	static _subscriptions = {
		beforeCreate: [],
		beforeUpdate: [],
		beforeDelete: [],
		beforeInject: [],
		beforeEject : [],

		afterCreate: [],
		afterUpdate: [],
		afterDelete: [],
		afterInject: [],
		afterEject : []
	}

	static subscribe = {
  	beforeCreate() {},
		beforeUpdate() {},
		beforeDelete() {},
		beroreInject() {},
		beforeEject () {},

		afterCreate() {},
		afterUpdate() {},
		afterDelete() {},
		afterInject() {},
		afterEject () {}
	}

}


