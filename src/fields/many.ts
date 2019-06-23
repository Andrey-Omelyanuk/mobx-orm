import { observable, observe } from 'mobx'
import store from '../store'


export function registerMany() {
    store.registerFieldType('many', (model_name, field_name, obj) => {
        // default value
        obj[field_name] = []
    })
}
registerMany()


export default function many(remote_model_name: any, foreign_field_on_remote_model: string) {
    return function (cls: any, field_name: string) {
        // It can be wrong name "Function" because we wrapped class in decorator before.
        // let model_name = cls.constructor.name === 'Function' ? cls.prototype.constructor.name : cls.constructor.name
        let model_name = cls.getModelName()

        // detect class name
        if (typeof remote_model_name === 'function')
            remote_model_name = remote_model_name.constructor.name == 'Function'
                ? remote_model_name.prototype.constructor.name
                : remote_model_name.constructor.name
        //
        if (!store.models[model_name])          store.registerModel(model_name)
        if (!store.models[remote_model_name])   store.registerModel(remote_model_name)
        store.registerModelField(model_name, 'many', field_name, {
            remote_model_name               : remote_model_name,
            foreign_field_on_remote_model   : foreign_field_on_remote_model
        })

        // register into mobx
        observable(cls, field_name)

        // watch for all foreign objects
        observe(store.models[remote_model_name].objects, (remote_change: any) => {
            switch (remote_change.type) {
                // remote object was injected
                case 'add':
                    // watch foreign field on remote object 
                    observe(remote_change.newValue, foreign_field_on_remote_model, (remote_foreign_field_change) => {
                        // remote old
                        if (remote_foreign_field_change.oldValue) {
                            let object_with_many = remote_foreign_field_change.oldValue
                            let index = object_with_many[field_name].indexOf(remote_change.newValue)
                            if (index > -1) {
                                object_with_many[field_name].splice(index, 1)
                            }
                        }
                        // add new
                        if (remote_foreign_field_change.newValue)
                            remote_foreign_field_change.newValue[field_name].push(remote_change.newValue)
                    })
                    break
                // object was removed 
                case 'remove':
                    let object_with_many = remote_change.oldValue[foreign_field_on_remote_model]
                    if (object_with_many) {
                        let index = object_with_many[field_name].indexOf(remote_change.oldValue)
                        if (index > -1) {
                            object_with_many[field_name].splice(index, 1)
                        }
                    }
                    break
            }
        })
    }
}
