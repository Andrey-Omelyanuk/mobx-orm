// import 'reflect-metadata'
import {intercept, observe, extendObservable, observable, autorun, when, reaction} from 'mobx'

function field_foreign(obj, field_name) {
    let edit_mode = false
    let settings = obj.model.fields[field_name].settings
    let foreign_model     = settings.foreign_model
    let foreign_ids_names = settings.foreign_ids_names

    // make observable and set default value
    extendObservable(obj, {
        [field_name]: null 
    })

    reaction(
        // watch on foreign cache for foreign object
        () => {
            let id = foreign_model.__id(obj, foreign_ids_names)
            return id ? foreign_model.cache[id] : null
        },
        // update foreign field
        (foreign_obj, prev, reaction) => {
            obj[field_name] = foreign_obj ? foreign_obj : null 
        })

    // Setter
    // 1. checks before set new changes
    intercept(obj, field_name, (change) => {
        if (change.newValue !== null && !(change.newValue.constructor && change.newValue.constructor == foreign_model.__proto__))
            throw new Error(`You can set only instance of "${foreign_model.__proto__.name}" or null`)
        return change
    })
    // 2. after changes run trigger for "change foreign_id"
    observe(obj, field_name, (change:any) => {
        let new_foreign_obj = change.newValue
        let old_foreign_obj = change.oldValue

        if (new_foreign_obj === old_foreign_obj || edit_mode)
            return  // it will help stop endless loop A.b -> A.b_id -> A.b -> A.b_id ...

        edit_mode = true
        try {
            if (change.newValue === null) {
                // if foreign set to null then reset ids on the obj
                for (let id_name of foreign_ids_names) {
                    obj[id_name] = null 
                }
            }
            else {
                // if foreign set to obj then update ids from the obj's ids
                let obj_ids = change.newValue.model.ids
                for (var i = 0; i < foreign_ids_names.length; i++) {
                    // do not touch if it the same
                    if (obj[foreign_ids_names[i]] != change.newValue[obj_ids[i]])
                        obj[foreign_ids_names[i]]  = change.newValue[obj_ids[i]]
                }
            }
            edit_mode = false
        }
        catch(e) {
            // rollback changes!
            if (change.oldValue === null) {
                for (var i = 0; i < foreign_ids_names.length; i++) {
                    obj[foreign_ids_names[i]] = null 
                }
            }
            else {
                let obj_ids = change.oldValue.model.ids
                for (var i = 0; i < foreign_ids_names.length; i++) {
                    obj[foreign_ids_names[i]] = change.oldValue[obj_ids[i]]
                }
            }
            edit_mode = false
            throw e
        }

        // if foreign have the one then update the one
        if (settings.one) {
            if (old_foreign_obj) {
                old_foreign_obj[settings.one] = null
            }
            if (new_foreign_obj) {
                new_foreign_obj[settings.one] = obj 
            }
        }

    })
}


export default function foreign(foreign_model: any, ...foreign_ids_names: string[]) {
    return function (cls: any, field_name: string) {
        let model = cls.constructor
        if (model.fields === undefined) model.fields = {}
        // register field 
        model.fields[field_name] = { 
            decorator: field_foreign,
            settings: {
                foreign_model: foreign_model,
                // if it is empty then try auto detect it (it works only with single id) 
                foreign_ids_names: foreign_ids_names.length ? foreign_ids_names : [`${field_name}_id`]
            } 
        } 

        // TODO finish it
        // watch on the foreign cache 
        // if foreign obj was created then it should be attached to foreign
        // if foreign obj was deleted then it should be removed from foreign
        // e.i. update foreign obj when foreign ids was changed
        // reaction(() => foreign_model.cache, (value, prev_value, reaction) => {
        //     debugger
        // })
    }
}
