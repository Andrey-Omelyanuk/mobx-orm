import { intercept, observe, observable, extendObservable, reaction, autorun } from 'mobx'
import { Model } from '../model'


function field_one(obj: Model, field_name: string) {
    let remote_model = obj.model.fields[field_name].settings.remote_model

    // make observable and set default value
    extendObservable(obj, {
        [field_name]: null 
    })

    // 1. checks before set new changes
    intercept(obj, <any>field_name, (change) => {
        if (change.newValue !== null && !(change.newValue.constructor && change.newValue.constructor === remote_model.__proto__))
                throw new Error(`You can set only instance of "${remote_model.__proto__.name}" or null`)
        return change
    })
}


export default function one(remote_model: any, remote_foreign_field?: string) {
    return function (cls: any, field_name: string) {
        let model = cls.prototype.constructor
        if (model.fields === undefined) model.fields = {}
        // if it is empty then try auto detect it (it works only with single id) 
        remote_foreign_field = remote_foreign_field ? remote_foreign_field : `${model.name.toLowerCase()}`
        model.fields[field_name] = { 
            decorator: field_one,
            settings: {
                remote_model: remote_model,
                remote_foreign_field: remote_foreign_field 
            } 
        } 
        
        if (remote_model.fields[remote_foreign_field].settings['one'])
            // TODO: do better message and add test for this case
            throw(`Duplicate declaration of the one field for ${field_name}`)
        remote_model.fields[remote_foreign_field].settings['one'] = field_name

        // // watch foreign fields on exists remote object 
        // for (let remote_object of Object.values(store.models[remote_model_name].objects)) {
        //     observe(remote_object, <any>foreign_field_on_remote_model, (remote_foreign_field_change) => {
        //         // remove old
        //         if (remote_foreign_field_change.oldValue) 
        //             remote_foreign_field_change.oldValue[field_name] = null
        //         // add new
        //         if (remote_foreign_field_change.newValue)
        //             remote_foreign_field_change.newValue[field_name] = remote_object
        //     })
        // }

        // // watch for remote object that related to one-field
        // observe(store.models[remote_model_name].objects, (remote_change) => {
        //     switch (remote_change.type) {
        //         // remote object was injected
        //         case 'add':
        //             // add to one  
        //             if (remote_change.newValue[foreign_field_on_remote_model])
        //                 remote_change.newValue[foreign_field_on_remote_model][field_name] = remote_change.newValue
        //             // watch foreign field on remote object 
        //             observe(remote_change.newValue, foreign_field_on_remote_model, (remote_foreign_field_change) => {
        //                 // remove old
        //                 if (remote_foreign_field_change.oldValue) 
        //                     remote_foreign_field_change.oldValue[field_name] = null
        //                 // add new
        //                 if (remote_foreign_field_change.newValue)
        //                     remote_foreign_field_change.newValue[field_name] = remote_change.newValue
        //             })
        //             break
        //         // remote object was ejected
        //         case 'remove':
        //             // TODO: check memory leaks (unsubscribe observer in 'add' section)
        //             let obj = remote_change.oldValue[foreign_field_on_remote_model]
        //             if (obj) 
        //                 obj[field_name] = null
        //             break
        //     }
        // })
    }
}
