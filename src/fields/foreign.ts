// import 'reflect-metadata'
import {intercept, observe, extendObservable, observable, autorun} from 'mobx'


function field_foreign(obj, field_name) {
    let edit_mode = false
    let foreign_model     = obj.model.fields[field_name].settings.foreign_model
    let foreign_ids_names = obj.model.fields[field_name].settings.foreign_ids_names

    // make observable and set default value
    extendObservable(obj, {
        [field_name]: null 
    })

    // Computed
    // watch "foreign id" fields
    // e.i. update foreign obj when foreign ids was changed
    autorun(() => {
        let id = foreign_model.__id(obj, foreign_ids_names)
        if (id) {
            let foreign_obj = foreign_model.cache[id]
            obj[field_name] = foreign_obj ? foreign_obj : null 
        }
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
        if (change.newValue === change.oldValue || edit_mode)
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
    }
}
