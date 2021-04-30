import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import Adapter from './adapters/adapter'


export class Model {

    private static ids          : any[] = []
    private static adapter      : Adapter
    private static cache        : { [string_id : string]: Model } = {} 
    private static field_types  : { [type_name : string]: (model_name: string, field_name: string, obj: Object) => void} = {} 
    private static fields       : {
        [field_name: string]: {
            type        : string,
            settings    : any,
            serialize   : any,
            deserialize : any
        }
    } = {}

    static async load(where = {}, order_by = {}, limit = 0, offset = 0) {
        await this.adapter.load(where, order_by, limit, offset)
        // TODO: return Query
        return 
    }

    static clearCache() {
        // we need it for run triggers on id fields 
        for (let obj of Object.values(this.cache)) {
            for (let id_field_name of this.ids) {
                obj[id_field_name] = null
            }
        }
    }

    // register field type in the store if not registered yet
    // TODO: remove method, field should add youself to field_types
    // TODO: and throw exception if  field_types[type] !== decorator
    // static registerFieldType(type, decorator) {
    //     if (!this.field_types[type])
    //         this.field_types[type] = decorator
    // }

    // register field as id in the description model
    // TODO: remove method, field should add youself to field_types
    // registerId(model_name, field_name) {
    //     let model_description = this.models[model_name]
    //     if (model_description.ids.indexOf(field_name) == -1)
    //         model_description.ids.push(field_name)
    //     else
    //         throw `Id "${field_name}" in model "${model_name}" already registered.`
    // }

    // register field in the model description if not registered yet
    // TODO: remove method, field should add youself to field_types
    // registerModelField(model_name, type, field_name, settings = {}, serialize = null, deserialize = null) {
    //     if (!this.models[model_name]) this.registerModel(model_name)
    //     let model_description = this.models[model_name]
    //     if (!model_description.fields[field_name])
    //         model_description.fields[field_name] = { type: type, settings: settings, serialize: serialize, deserialize: deserialize }
    //     else
    //         throw `Field "${field_name}" on "${model_name}" already registered.`
    // }


    // static getModelName() : string {
    //     return this.prototype.constructor.name
    // }

    private readonly _init_data

    constructor(init_data?) {
        // we have to save init data for detect changes
        this._init_data = init_data
    }

    // build id string from ids fields and return it
    @computed({keepAlive: true}) get __id() : string | null {
        let id = '' 
        for (let id_name_field of Model.ids) {
            // if any id field is null then we should return null because id is not complite
            if (this[id_name_field] === null || this[id_name_field] === undefined) 
                return null
            id += `${this[id_name_field]} :`
        }
        return id
    }

    // TODO: instead of 'any' I whant to use Model constructor
    get model() : any {
        return this.constructor
    }

    // create or update object in the repo 
    async save() {
        return this.model.adapter.save(this)
    }

    // delete object from the repo 
    async delete() {
        return this.model.adapter.delete(this)
    }

    // add obj to the cache
    @action inject() {
        if (this.__id === null)                    
            throw new Error(`Object should have id!`)
        if (this.model.cache[this.__id])  
            throw new Error(`Object with id "${this.__id}" already exist in the cache of model: "${this.model.name}")`)
        this.model.cache[this.__id] = this 
    }

    // remove obj from the cache
    @action eject() {
        if (this.__id === null)
            return                   
        if (!this.model.cache[this.__id]) 
            throw new Error(`Object with id "${this.__id}" not exist in the cache of model: ${this.model.name}")`)
        delete this.model.cache[this.__id]
    }
}


// Decorator
export function model(cls) {
    let model_name = cls.getModelName()

    // the new constructor behaviour
    let f : any = function (...args) {
        let c : any = function () { return cls.apply(this, args) }
        c.__proto__ = cls.__proto__
        c.prototype = cls.prototype

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

        makeObservable(obj)
        // apply decorators
        for (let field_name in model_description.fields) {
            let type = model_description.fields[field_name].type
            cls.field_types[type](model_name, field_name, obj)
        }
        
        runInAction(() => {
            if (init_data)
                for (let field_name in init_data)
                    obj[field_name] = init_data[field_name]
        })
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
