// import 'reflect-metadata'
import store from '../store'
import {intercept, observe, observable, autorun} from 'mobx'


let type = 'foreign'

export function registerForeign() {
    store.registerFieldType(type, (model_name, field_name, obj) => {
        let edit_mode = false
        let foreign_model_name     = store.models[model_name].fields[field_name].settings.foreign_model_name
        let foreign_id_field_names = store.models[model_name].fields[field_name].settings.foreign_id_field_names

        // Computed
        // watch "foreign id" fields
        // e.i. update foreign obj when foreign ids was changed
        autorun(() => {
            let id = store.getId(obj, foreign_id_field_names)
            if (store.models[foreign_model_name]) {
                let foreign_obj = store.models[foreign_model_name].objects[id]
                obj[field_name] = foreign_obj ? foreign_obj : null 
            }
        })

        // Setter
        // 1. checks before set new changes
        intercept(obj, field_name, (change) => {
            if (change.newValue !== null && !(change.newValue.constructor && change.newValue.constructor.name == foreign_model_name))
                throw new Error(`You can set only instance of "${foreign_model_name}" or null`)
            return change
        })
        // 2. after changes run trigger for "change foreign_id"
        observe(obj, field_name, (change:any) => {
            if (change.newValue === change.oldValue || edit_mode)
                return  // it will help stop endless loop A.b -> A.b_id -> A.b -> A.b_id ...

            edit_mode = true
            try {
                if (change.newValue === null) {
                    for (var i = 0; i < foreign_id_field_names.length; i++) {
                        obj[foreign_id_field_names[i]] = null 
                    }
                }
                else {
                    let foreign_model_description = change.newValue.getModelDescription()
                    for (var i = 0; i < foreign_id_field_names.length; i++) {
                        obj[foreign_id_field_names[i]] = change.newValue[foreign_model_description.ids[i]]
                    }
                }
                edit_mode = false
            }
            catch(e) {
                // rollback changes!
                if (change.oldValue === null) {
                    for (var i = 0; i < foreign_id_field_names.length; i++) {
                        obj[foreign_id_field_names[i]] = null 
                    }
                }
                else {
                    let foreign_model_description = change.newValue.getModelDescription()
                    for (var i = 0; i < foreign_id_field_names.length; i++) {
                        obj[foreign_id_field_names[i]] = change.oldValue[foreign_model_description.ids[i]]
                    }
                }
                edit_mode = false
                throw e
            }
        })

        // default value
        if (obj[field_name] === undefined) obj[field_name] = null
    })
}
registerForeign()


export default function foreign(foreign_model_name: any, ...foreign_id_field_names: string[]) {
    return function (cls: any, field_name: string) {

        // It can be wrong name "Function" because we wrapped class in decorator before.
        // let model_name = cls.constructor.name === 'Function' ? cls.prototype.constructor.name : cls.constructor.name
        let model_name = cls.getModelName()

        //
        if (typeof foreign_model_name === 'function')
            foreign_model_name = foreign_model_name.constructor.name == 'Function' ? foreign_model_name.prototype.constructor.name : foreign_model_name.constructor.name

        store.registerModelField(model_name, type, field_name, {
            foreign_model_name    : foreign_model_name,
            foreign_id_field_names: foreign_id_field_names.length ? foreign_id_field_names : [`${field_name}_id`]
        })

        // register into mobx
        observable(cls, field_name)
    }
}
