import { action, configure, observable } from 'mobx'
import { Model } from './model'
import { Adapter, DefaultAdapter } from './adapter'

configure({
    enforceActions: "never",
})

export interface FieldTypeDecorator {
    (model_name: string, field_name: string, obj: Object): void
}

export interface ModelDescription {
    ids     : any[]
    fields  : {
        [field_name: string]: {
            type        : undefined | string,
            settings    : undefined | any,
            serialize   : undefined | any,
            deserialize : undefined | any
        }
    },
    objects : {
        [string_id: string]: Model 
    } 
    adapter : Adapter
}

/*
Функции хранилища:
    Note: all functions return nothing, you can catch errors in exception

    model 								(cls) - декоратор для класса, который мы хотим зарегистрировать как модель
    registerModel 				(model_name) - register model in store if not registered yet
    registerModelPk				(model_name, fieldKey)	-
    registerModelField 		(model_name, fieldKey, fieldWrapper) 				-
*/

export class Store {

                debug      : boolean = false 
    @observable models     : { [model_name: string]: ModelDescription   } = {}
                field_types: { [type_name : string]: FieldTypeDecorator } = {}

    registerModel(model_name) {
        if (!this.models[model_name]) {
            let _count_id = 0
            this.models[model_name] = {
                ids     : [],
                fields  : {},
                objects : {},
                adapter : new DefaultAdapter()
            }
            this.models[model_name].objects = observable(this.models[model_name].objects)
        }
        else throw new Error(`Model "${model_name}" already registered.`)
    }

    registerFieldType(type, decorator) {
        if (!this.field_types[type])
            this.field_types[type] = decorator
        else
            throw new Error(`Field type "${type}" already registered.`)
    }

    registerModelField(model_name, type, field_name, settings = {}, serialize = null, deserialize = null) {
        if (!this.models[model_name]) this.registerModel(model_name)
        let model_description = this.models[model_name]

        if (!model_description.fields[field_name])
            model_description.fields[field_name] = { type: type, settings: settings, serialize: serialize, deserialize: deserialize }
        else
            throw `Field "${field_name}" on "${model_name}" already registered.`
    }

    registerId(model_name, field_name) {
        if (!this.models[model_name]) this.registerModel(model_name)
        let model_description = this.models[model_name]

        if (model_description.ids.indexOf(field_name) != -1)
            throw `Id "${field_name}" in model "${model_name}" already registered.`
        else
            model_description.ids.push(field_name)
    }

    inject(obj: Model) {
        let model_description = obj.getModelDescription()
        if (obj.__id === null)                    throw new Error(`Object should have id!`)
        if (model_description.objects[obj.__id])  throw new Error(`Object with id "${obj.__id}" already exist in the store (model: "${obj.getModelName()}")`)
        model_description.objects[obj.__id] = obj
    }

    eject(obj: Model) {
        if (obj.__id === null) return                   
        let model_description = obj.getModelDescription()
        if (!model_description.objects[obj.__id]) throw new Error(`Object with id "${obj.__id}" not exist in the store (model: ${obj.getModelName()}")`)
        delete model_description.objects[obj.__id]
    }

    clear() {
        for (let model_name of Object.keys(this.models)) {
            this.clearModel(model_name)
        }
        this.models = {}
    }

    clearModel(model_name) {
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

}
let store = new Store()
export default store

// declare let window: any
// if (window) 
//     window.mobx_orm_store = store
