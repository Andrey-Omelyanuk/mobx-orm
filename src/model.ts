import { computed } from 'mobx'
import store, { ModelDescription } from './store'


export class Model {

    static get(id: string): Model {
        let model_description = this.getModelDescription()
        return model_description.objects[id]
    }

    static all(): Model[] {
        let model_description = this.getModelDescription()
        return Object.values(model_description.objects)
    }

    static async load(where = {}, order_by = {}, limit = 0, offset = 0) {
        let model_description = this.getModelDescription()
        return model_description.adapter.load(this, where, order_by, limit, offset)
    }

    static getModelName() : string {
        return this.prototype.constructor.name
    }

    static getModelDescription() : ModelDescription {
        let model_name = this.getModelName()
        let model_description = store.models[model_name]
        if (model_description === undefined) 
            throw Error(`Description for '${model_name}' is not exist. Maybe, you called store.clear after model declaration.`)
        return model_description
    }

    private readonly _init_data

    constructor(init_data?) {
        this._init_data = init_data
    }

    @computed({keepAlive: true}) get __id() : string | null {
        return store.getId(this, this.getModelDescription().ids)
    }

    getModelName() : string {
        return this.constructor.name
    }

    getModelDescription() : ModelDescription {
        let model_name = this.getModelName() 
        let model_description = store.models[model_name]
        if (model_description === undefined) 
            throw Error(`Description for '${model_name}' is not exist. Maybe, you called store.clear after model declaration.`)
            // throw new Error(`Model name "${model_name} is not registered in the store`)
        return model_description
    }
    
    async save() {
        return this.getModelDescription().adapter.save(this)
    }

    async delete() {
        return this.getModelDescription().adapter.delete(this)
    }
}


// Decorator
export function model(cls) {
    // the new constructor behaviour
    let f : any = function (...args) {
        let c : any = function () { return cls.apply(this, args) }
        c.__proto__ = cls.__proto__
        c.prototype = cls.prototype

        let model_name        = cls.getModelName()
        let model_description = cls.getModelDescription()

        let obj  = new c()
        let init_data = obj._init_data ? obj._init_data : {}
        delete obj._init_data

        // save defaults from class declaration
        for (let field_name in model_description.fields) {
            if (obj[field_name] !== undefined && init_data[field_name] === undefined) {
                init_data[field_name] = obj[field_name]
            }
        }

        // apply decorators
        for (let field_name in model_description.fields) {
            let type = model_description.fields[field_name].type
            store.field_types[type](model_name, field_name, obj)
        }
        
        if (init_data)
            for (let field_name in init_data)
                obj[field_name] = init_data[field_name]

        return obj
    }
    // copy static properties/methods
    for (let prop_name of Object.getOwnPropertyNames(cls))
        if(f[prop_name] == undefined)
            f[prop_name] = cls[prop_name]

    f.__proto__ = cls.__proto__
    f.prototype = cls.prototype   // copy prototype so intanceof operator still works
    return f                      // return new constructor (will override original)
}
