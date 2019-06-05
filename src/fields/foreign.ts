// import 'reflect-metadata'
import store from '../store'
import {intercept, observe, observable, autorun} from 'mobx'


let type = 'foreign'

export function registerForeign() {
    store.registerFieldType(type, (model_name, field_name, obj) => {

        let foreign_model_name    = store.models[model_name].fields[field_name].settings.foreign_model_name
        let foreign_id_field_name = store.models[model_name].fields[field_name].settings.foreign_id_field_name

        // Computed
        // watch "foreign_id" field
        // e.i. update foreign obj when foreign id was changed
        autorun(() => {
            let foreign_obj = store.models[foreign_model_name].objects[obj[foreign_id_field_name]]
            obj[field_name] = foreign_obj ? foreign_obj : null
        })

        // Setter
        // 1. checks before set new changes
        intercept(obj, field_name, (change) => {
            if (change.newValue !== null && !(change.newValue.constructor && change.newValue.constructor.name == foreign_model_name))
                throw new Error(`You can set only instance of "${foreign_model_name}" or null`)
            if (change.newValue !== null && change.newValue.id === null)
                throw new Error(`Object should have id!`)
            return change
        })
        // 2. after changes run trigger for "change foreign_id"
        observe(obj, field_name, (change) => {
            if (change.newValue === change.oldValue)
                return  // it will help stop endless loop A.b -> A.b_id -> A.b -> A.b_id ...

            try {
                obj[foreign_id_field_name] = change.newValue === null ? null : change.newValue.id
            }
            catch(e) {
                // rollback changes!
                obj[foreign_id_field_name] = change.oldValue === null ? null : change.oldValue.id
                throw e
            }
        })

        // default value
        if (obj[field_name] === undefined) obj[field_name] = null
    })
}
registerForeign()


export default function foreign(foreign_model_name: any, foreign_id_field_name?: string) {
    return function (cls: any, field_name: string) {

        // It can be wrong name "Function" because we wrapped class in decorator before.
        let model_name = cls.constructor.name === 'Function' ? cls.prototype.constructor.name : cls.constructor.name

        //
        if (typeof foreign_model_name === 'function')
            foreign_model_name = foreign_model_name.constructor.name == 'Function' ? foreign_model_name.prototype.constructor.name : foreign_model_name.constructor.name

        store.registerModelField(model_name, type, field_name, {
            foreign_model_name   : foreign_model_name,
            foreign_id_field_name: foreign_id_field_name ? foreign_id_field_name : `${field_name}_id`
        })

        // register into mobx
        observable(cls, field_name)
    }
}
