import store from '../store'
import {intercept, observe, observable} from 'mobx'


export function registerOne() {
    store.registerFieldType('one', (model_name, field_name, obj) => {
        let foreign_model_name    = store.models[model_name].fields[field_name].settings.foreign_model_name
        let foreign_id_field_name = store.models[model_name].fields[field_name].settings.foreign_id_field_name

        // Setter
        // 1. checks before set new changes
        intercept(obj, field_name, (change) => {
            if (change.newValue !== null) {
                if (!(change.newValue.constructor && change.newValue.constructor.name === foreign_model_name))
                    throw new Error(`You can set only instance of "${foreign_model_name}" or null`)
                if (change.newValue.id === null)
                    throw new Error(`Object should have id!`)
            }
            return change
        })
        // 2. after changes run trigger for "change foreign_id"
        observe(obj, field_name, (change) => {
            if (change.newValue === change.oldValue)
                return  // it will help stop endless loop A.b -> B.a_id -> A.b -> B.a_id ...

            let prev_old = null
            let prev_new = null
            try {
                if (change.oldValue) {
                    prev_old = change.oldValue[foreign_id_field_name]
                    change.oldValue[foreign_id_field_name] = null
                }
                if (change.newValue) {
                    prev_new = change.newValue[foreign_id_field_name]
                    change.newValue[foreign_id_field_name] = obj.id
                }
            }
            catch(e) {
                // rollback changes!
                if (change.newValue)
                    change.newValue[foreign_id_field_name] = prev_new
                if (change.oldValue)
                    change.oldValue[foreign_id_field_name] = prev_old
                throw e
            }
        })

        // default value
        obj[field_name] = null
    })
}
registerOne()


export default function one(foreign_model_name: any, foreign_id_field_name: string) {
    return function (cls: any, field_name: string) {

        // It can be wrong name "Function" because we wrapped class in decorator before.
        let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name

        //
        if (typeof foreign_model_name === 'function')
            foreign_model_name = foreign_model_name.constructor.name == 'Function' ? foreign_model_name.prototype.constructor.name : foreign_model_name.constructor.name

        if (!store.models[model_name])         store.registerModel(model_name)
        if (!store.models[foreign_model_name]) store.registerModel(foreign_model_name)
        store.registerModelField(model_name, 'one', field_name, {
            foreign_model_name   : foreign_model_name,
            foreign_id_field_name: foreign_id_field_name
        })

        // register into mobx
        observable(cls, field_name)

        // сдедим за созданием объектов, для первого подсчета one
        observe(store.models[model_name].objects, (change) => {
            if (change.type == 'add')
                for (let obj of Object.values(store.models[foreign_model_name].objects))
                    if (obj[foreign_id_field_name] == change.newValue.id)
                        change.newValue[field_name] = obj
        })

        // следим за всеми foreign объектами
        observe(store.models[foreign_model_name].objects, (change) => {
            switch (change.type) {
                // появился новый объект
                case 'add':
                    let new_object = store.models[model_name].objects[(<any>change).newValue[foreign_id_field_name]]
                    if (new_object)
                        new_object[field_name] = change.newValue

                    // подписываемся на каждый объект
                    observe(change.newValue, foreign_id_field_name, (field_change) => {
                        // first delete old
                        if (field_change.oldValue) {
                            let object = store.models[model_name].objects[field_change.oldValue]
                            object[field_name] = null
                        }
                        //
                        if (field_change.newValue) {
                            let obj = store.models[model_name].objects[field_change.newValue]
                            if (obj)
                                obj[field_name] = change.newValue
                        }
                    })
                    break
                // удалили объект
                case 'remove':
                    let old_object = store.models[model_name].objects[(<any>change).oldValue[foreign_id_field_name]]
                    if (old_object)
                            old_object[field_name] = null
                    break
            }
        })
    }
}
