import { intercept, observe, observable, extendObservable, reaction, autorun } from 'mobx'
import { Model } from '../model'


function field_many(obj: Model, field_name) {

    let edit_mode = false
    let remote_model            = obj.model.fields[field_name].settings.remote_model
    let remote_foreign_ids_name = obj.model.fields[field_name].settings.remote_foreign_ids_names

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

    // 2. after changes run trigger for "change foreign_id"
    observe(obj, field_name, (change:any) => {
        let old_remote_obj = change.oldValue
        let new_remote_obj = change.newValue

        if (new_remote_obj === old_remote_obj || edit_mode)
            return  // it will help stop endless loop A.b -> B.a_id -> A.b -> B.a_id ...

        edit_mode = true
        try {
            // remove foreign ids on the old remote obj
            if (old_remote_obj) {
                for (let id_name of remote_foreign_ids_name) {
                    old_remote_obj[id_name] = null 
                }
            }
            // set foreign ids on the remote obj 
            if (new_remote_obj) {
                let obj_ids = obj.model.ids 
                for (var i = 0; i < remote_foreign_ids_name.length; i++) {
                    // do not touch if it the same
                    if (new_remote_obj[remote_foreign_ids_name[i]] != obj[obj_ids[i]])
                        new_remote_obj[remote_foreign_ids_name[i]] = obj[obj_ids[i]]
                }
            }
            edit_mode = false
        }
        catch(e) {
            // TODO: we need to test rallback
            // // rollback changes!
            // if (change.oldValue === null) {
            //     for (var i = 0; i < foreign_ids_names.length; i++) {
            //         obj[foreign_ids_names[i]] = null 
            //     }
            // }
            // else {
            //     let obj_ids = change.oldValue.model.ids
            //     for (var i = 0; i < foreign_ids_names.length; i++) {
            //         obj[foreign_ids_names[i]] = change.oldValue[obj_ids[i]]
            //     }
            // }
            // edit_mode = false
            // throw e
        }
    })
}

export default function many(remote_model: any, ...remote_foreign_ids_names: string[]) {
    return function (cls: any, field_name: string) {
        let model = cls.prototype.constructor
        if (model.fields === undefined) model.fields = {}
        // if it is empty then try auto detect it (it works only with single id) 
        remote_foreign_ids_names = remote_foreign_ids_names.length ? remote_foreign_ids_names: [`${model.name.toLowerCase()}_id`]
        model.fields[field_name] = { 
            decorator: field_many,
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
                            // TODO: is it not bad?
                            // if (obj[field_name])
                            //     // TODO better name of error
                            //     // TODO add test for this case
                            //     throw ('One: bad')
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
    }
}