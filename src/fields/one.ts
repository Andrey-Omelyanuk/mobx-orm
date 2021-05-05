import { intercept, observe, observable, extendObservable } from 'mobx'
import { Model } from '../model'


function field_one(obj: Model, field_name: string) {
    let remote_model = obj.model.fields[field_name].settings.remote_model

    // make observable and set default value
    extendObservable(obj, {
        [field_name]: null 
    })

    // 1. checks before set new changes
    intercept(obj, <any>field_name, (change) => {
        if (change.newValue !== null && !(change.newValue.constructor && change.newValue.constructor.name === remote_model.__proto__))
                throw new Error(`You can set only instance of "${remote_model.__proto__.name}" or null`)
        return change
    })

}


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

        // watch foreign fields on exists remote object 
        for (let remote_object of Object.values(store.models[remote_model_name].objects)) {
            observe(remote_object, <any>foreign_field_on_remote_model, (remote_foreign_field_change) => {
                // remove old
                if (remote_foreign_field_change.oldValue) 
                    remote_foreign_field_change.oldValue[field_name] = null
                // add new
                if (remote_foreign_field_change.newValue)
                    remote_foreign_field_change.newValue[field_name] = remote_object
            })
        }

        // watch for remote object that related to one-field
        observe(store.models[remote_model_name].objects, (remote_change) => {
            switch (remote_change.type) {
                // remote object was injected
                case 'add':
                    // add to one  
                    if (remote_change.newValue[foreign_field_on_remote_model])
                        remote_change.newValue[foreign_field_on_remote_model][field_name] = remote_change.newValue
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
