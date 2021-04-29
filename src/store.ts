import { action, configure, observable, makeObservable } from 'mobx'
import { Model } from './model'
import { IAdapter, DefaultAdapter } from './adapter'


// TODO: remove enforceAction
configure({
    enforceActions: "never",
})

export interface FieldTypeDecorator {
    (model_name: string, field_name: string, obj: Object): void
}


export class ModelDescription {
    ids     : any[] = []
    // descriptions of fields of model
    fields  : {
        [field_name: string]: {
            type        : undefined | string,
            settings    : undefined | any,
            serialize   : undefined | any,
            deserialize : undefined | any
        }
    } = {}
    // cache
    @observable objects : {[string_id: string]: Model} = {}
    // 
    adapter : IAdapter = new DefaultAdapter()

    constructor() {
        makeObservable(this)
    }
}


export class Store {

    // models that were registered in store
    models     : { [model_name: string]: ModelDescription   } = {}
    // field types that were registered in store
    field_types: { [type_name : string]: FieldTypeDecorator } = {} 
    
    constructor() {
        makeObservable(this)
    }

    // register model in the store if not registered yet
    registerModel(model_name) {
        if (!this.models[model_name])
            this.models[model_name] = new ModelDescription()
        else 
            throw new Error(`Model "${model_name}" already registered.`)
    }

    // register field type in the store if not registered yet
    registerFieldType(type, decorator) {
        if (!this.field_types[type])
            this.field_types[type] = decorator
        else
            throw new Error(`Field type "${type}" already registered.`)
    }

    // register field in the model description if not registered yet
    registerModelField(model_name, type, field_name, settings = {}, serialize = null, deserialize = null) {
        if (!this.models[model_name]) this.registerModel(model_name)
        let model_description = this.models[model_name]

        if (!model_description.fields[field_name])
            model_description.fields[field_name] = { type: type, settings: settings, serialize: serialize, deserialize: deserialize }
        else
            throw `Field "${field_name}" on "${model_name}" already registered.`
    }

    // register field as id in the description model
    registerId(model_name, field_name) {
        let model_description = this.models[model_name]
        if (model_description.ids.indexOf(field_name) == -1)
            model_description.ids.push(field_name)
        else
            throw `Id "${field_name}" in model "${model_name}" already registered.`
    }

    // add obj to cache
    @action
    inject(obj: Model) {
        let model_description = obj.getModelDescription()

        if (obj.__id === null)                    
            throw new Error(`Object should have id!`)
        if (model_description.objects[obj.__id])  
            throw new Error(`Object with id "${obj.__id}" already exist in the store (model: "${obj.getModelName()}")`)

        model_description.objects[obj.__id] = obj
    }

    // remove obj from cache
    @action
    eject(obj: Model) {
        let model_description = obj.getModelDescription()

        if (obj.__id === null)
            return                   
        if (!model_description.objects[obj.__id]) 
            throw new Error(`Object with id "${obj.__id}" not exist in the store (model: ${obj.getModelName()}")`)

        delete model_description.objects[obj.__id]
    }

    // build id string from ids fields and return it
    getId(obj: Model, id_name_fields: string[]) : string | null {
        let id = '' 
        for (let id_name_field of id_name_fields) {
            // if any id field is null then we should return null
            // because id is not complite
            if (obj[id_name_field] === null || obj[id_name_field] === undefined) 
                return null
            id += `${obj[id_name_field]} :`
        }
        return id
    }

    // remove all models and clear all cache 
    reset() {
        for (let model_name of Object.keys(this.models)) {
            this.removeModel(model_name)
        }
        // do not reset field types
        // this.field_types = {}
    }

    // clear all cache 
    resetAllCache() {
        for (let model_name of Object.keys(this.models)) {
            this.clearCacheForModel(model_name)
        }
    }

    // clear cache and remove model from store
    removeModel(model_name) {
        this.clearCacheForModel(model_name)
        delete this.models[model_name]
    }

    // clear cache for model
    @action
    clearCacheForModel(model_name) {
        let model_desc = this.models[model_name]
        if (model_desc) {
            // we need it for run triggers on id fields 
            for (let obj of Object.values(model_desc.objects)) {
                for (let id_field_name of model_desc.ids) {
                    obj[id_field_name] = null
                }
            }
        }
    }
}

let store = new Store()
export default store
