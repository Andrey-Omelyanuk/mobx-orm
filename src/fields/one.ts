import { store, Model } from '../index'
import {intercept, observe, observable} from 'mobx'


export function registerOne() {
    store.registerFieldType('one', (model_name: string, field_name: string, obj: Model) => {
        let remote_model_name             = store.models[model_name].fields[field_name].settings.remote_model_name
        let foreign_field_on_remote_model = store.models[model_name].fields[field_name].settings.foreign_field_on_remote_model

        // 1. checks before set new changes
        intercept(obj, <any>field_name, (change) => {
            if (change.newValue !== null && !(change.newValue.constructor && change.newValue.constructor.name === remote_model_name))
                    throw new Error(`You can set only instance of "${remote_model_name}" or null`)
            return change
        })

        // default value
        obj[field_name] = null
    })
}
registerOne()


export default function one(remote_model_name: any, foreign_field_on_remote_model: string) {
    return function (cls: any, field_name: string) {
        // It can be wrong name "Function" because we wrapped class in decorator before.
        // let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name
        let model_name = cls.getModelName()

        // detect class name
        if (typeof remote_model_name === 'function')
            remote_model_name = remote_model_name.constructor.name == 'Function' 
                ? remote_model_name.prototype.constructor.name 
                : remote_model_name.constructor.name

        if (!store.models[model_name])         store.registerModel(model_name)
        if (!store.models[remote_model_name])  store.registerModel(remote_model_name)
        store.registerModelField(model_name, 'one', field_name, {
            remote_model_name               : remote_model_name,
            foreign_field_on_remote_model   : foreign_field_on_remote_model
        })

        // register into mobx
        observable(cls, field_name)

        // watch for remote object that related to one-field
        observe(store.models[remote_model_name].objects, (remote_change) => {
            switch (remote_change.type) {
                // remote object was injected
                case 'add':
                    // watch foreign field on remote object 
                    observe(remote_change.newValue, foreign_field_on_remote_model, (remote_foreign_field_change) => {
                        // remove old
                        if (remote_foreign_field_change.oldValue) 
                            remote_foreign_field_change.oldValue[field_name] = null
                        // add new
                        if (remote_foreign_field_change.newValue)
                            remote_foreign_field_change.newValue[field_name] = remote_change.newValue
                    })
                    break
                // remote object was ejected
                case 'remove':
                    // TODO: check memory leaks (unsubscribe observer in 'add' section)
                    let obj = remote_change.oldValue[foreign_field_on_remote_model]
                    if (obj) 
                        obj[field_name] = null
                    break
            }
        })
    }
}
