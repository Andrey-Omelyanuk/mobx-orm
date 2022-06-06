import { intercept, observe, observable, extendObservable, reaction, autorun, runInAction } from 'mobx'
import { Model } from '../model'


function field_many(obj: Model, field_name) {

    let edit_mode = false
    let remote_model            = obj.model.__relations[field_name].settings.remote_model
    let remote_foreign_ids_name = obj.model.__relations[field_name].settings.remote_foreign_ids_names

    // make observable and set default value
    extendObservable(obj, {
        [field_name]: []
    })

    // 1. checks before set new changes
    intercept(obj[field_name], (change: any) => {
        // TODO
        // if (change.newValue !== null && !(change.newValue.constructor && change.newValue.constructor === remote_model.__proto__))
        //         throw new Error(`You can set only instance of "${remote_model.__proto__.name}" or null`)

        // TODO: if we push exist obj then ignore it? and not duplicate
        // TODO: create a test for this case 
        // remote obj can be in the many 
        // for (let new_remote_obj of change.added) {
        //     const i = obj[field_name].indexOf(new_remote_obj)
        //     if (i == -1)
        //         throw new Error(`"${new_remote_obj.model.name}" id:"${new_remote_obj.__id}" alredy in many "${obj.model.name}" id:"${field_name}"`)
        // }
        return change
    })

    // 2. after changes run trigger for "change foreign_id"
    observe(obj[field_name], (change:any) => {
        if (change.type !== 'splice')
            return 

        let old_remote_objs = change.removed
        let new_remote_objs = change.added

        edit_mode = true
        try {
            // remove foreign ids on the old remote objs
            for(let old_remote_obj of old_remote_objs)
                for (let id_name of remote_foreign_ids_name)
                    old_remote_obj[id_name] = null 
            // set foreign ids on the remote objs 
            let obj_ids: any = Array.from(obj.model.__ids.keys())
            for(let new_remote_obj of new_remote_objs) {
                for (var i = 0; i < remote_foreign_ids_name.length; i++) {
                    // do not touch if it the same
                    if (new_remote_obj[remote_foreign_ids_name[i]] != obj[obj_ids[i]])
                        new_remote_obj[remote_foreign_ids_name[i]]  = obj[obj_ids[i]]
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
        if (model.__relations === undefined) model.__relations = {}
        // if it is empty then try auto detect it (it works only with single id) 
        remote_foreign_ids_names = remote_foreign_ids_names.length ? remote_foreign_ids_names: [`${model.name.toLowerCase()}_id`]
        model.__relations[field_name] = { 
            decorator: field_many,
            settings: {
                remote_model: remote_model,
                remote_foreign_ids_names: remote_foreign_ids_names
            } 
        } 
        
        // watch for remote object in the cache 
        observe(remote_model.__cache, (remote_change: any) => {
            let remote_obj
            switch (remote_change.type) {
                case 'add':
                    remote_obj = remote_change.newValue
                    remote_obj.__disposers.set(`many ${field_name}` ,autorun(() => {
                        let obj =  model.__cache.get(model.__id(remote_obj, remote_foreign_ids_names))
                        if (obj) {
                            const i = obj[field_name].indexOf(remote_obj)
                            if (i == -1)
                                runInAction(() => { obj[field_name].push(remote_obj) })
                        }
                    }))
                    break
                case 'delete':
                    remote_obj = remote_change.oldValue
                    if (remote_obj.__disposers.get(`many ${field_name}`)) {
                        remote_obj.__disposers.get(`many ${field_name}`)()
                        remote_obj.__disposers.delete(`many ${field_name}`)
                    }
                    let obj =  model.__cache.get(model.__id(remote_obj, remote_foreign_ids_names))
                    if (obj) {
                        const i = obj[field_name].indexOf(remote_obj)
                        if (i > -1)
                            runInAction(() => { obj[field_name].splice(i, 1); })
                    } 
                    break
            }
        })
    }
}