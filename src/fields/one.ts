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


export default function one(remote_model: any, ...remote_foreign_ids_names: string[]) {
    return function (cls: any, field_name: string) {
        let model = cls.prototype.constructor
        if (model.fields === undefined) model.fields = {}
        // if it is empty then try auto detect it (it works only with single id) 
        remote_foreign_ids_names = remote_foreign_ids_names.length ? remote_foreign_ids_names: [`${model.name.toLowerCase()}_id`]
        model.fields[field_name] = { 
            decorator: field_one,
            settings: {
                remote_model: remote_model,
                remote_foreign_ids_names: remote_foreign_ids_names
            } 
        } 
        
        // watch for remote object in the cache 
        observe(remote_model.cache, (remote_change: any) => {
            let remote_obj
            switch (remote_change.type) {
                case 'add':
                    remote_obj = remote_change.newValue
                    remote_obj.disposers.set(`one ${field_name}` ,autorun(() => {
                        let obj =  model.cache.get(model.__id(remote_obj, remote_foreign_ids_names))
                        if (obj) {
                            if (obj[field_name])
                                // TODO better name of error
                                // TODO add test for this case
                                throw ('One: bad')
                            obj[field_name] = remote_obj
                        }
                    }))
                    break
                case 'delete':
                    remote_obj = remote_change.oldValue
                    if (remote_obj.disposers.get(`one ${field_name}`)) {
                        remote_obj.disposers.get(`one ${field_name}`)()
                        remote_obj.disposers.delete(`one ${field_name}`)
                    }
                    let obj =  model.cache.get(model.__id(remote_obj, remote_foreign_ids_names))
                    if (obj) 
                        obj[field_name] = null
                    break
            }
        })

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
        //     }
        // })
    }
}
