import { observable, observe } from 'mobx'
import store from '../store'


export function registerMany() {
    store.registerFieldType('many', (model_name, field_name, obj) => {
        // default value
        obj[field_name] = []
    })
}
registerMany()


export default function many(foreign_model_name: any, foreign_id_field_name: string) {
    return function (cls: any, many_field_name: string) {

        // It can be wrong name "Function" because we wrapped class in decorator before.
        let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name
        // detect class name
        if (typeof foreign_model_name === 'function')
            foreign_model_name
                = foreign_model_name.constructor.name == 'Function'
                ? foreign_model_name.prototype.constructor.name
                : foreign_model_name.constructor.name

        if (!store.models[model_name])         store.registerModel(model_name)
        if (!store.models[foreign_model_name]) store.registerModel(foreign_model_name)
        store.registerModelField(model_name, 'many', many_field_name, {
            foreign_model_name   : foreign_model_name,
            foreign_id_field_name: foreign_id_field_name
        })

        // register into mobx
        observable(cls, many_field_name)

        // watch for creation of new objects for first calculation of "many"
        observe(store.models[model_name].objects, (change) => {
            if (change.type == 'add')
                for (let obj of Object.values(store.models[foreign_model_name].objects))
                    if (obj[foreign_id_field_name] == change.newValue.id)
                        change.newValue[many_field_name].push(obj)
        })

        // watch for all foreign objects
        observe(store.models[foreign_model_name].objects, (change: any) => {
            let foreign_object   : any
            let object_with_many : any
            switch (change.type) {
                // new object was added 
                case 'add':
                    foreign_object = change.newValue
                    object_with_many = store.models[model_name].objects[foreign_object[foreign_id_field_name]]
                    if (object_with_many) {
                        if(store.debug) console.log(`many ${model_name}.${many_field_name} of ${object_with_many.id} add ${foreign_object.id} start`)
                        object_with_many[many_field_name].push(foreign_object)
                        if(store.debug) console.log(`many ${model_name}.${many_field_name} of ${object_with_many.id} add ${foreign_object.id} finish`)
                    }

                    observe(foreign_object, foreign_id_field_name, (field_change) => {
                        if (field_change.newValue) {
                            let object_with_many_id = field_change.newValue
                            let object_with_many = store.models[model_name].objects[object_with_many_id]
                            if (object_with_many) {
                                if(store.debug) console.log(`many ${model_name}.${many_field_name} of ${object_with_many_id} add ${foreign_object.id} start`)
                                object_with_many[many_field_name].push(foreign_object)
                                if(store.debug) console.log(`many ${model_name}.${many_field_name} of ${object_with_many_id} add ${foreign_object.id} finish`)
                            }
                        }
                        if (field_change.oldValue) {
                            let object_with_many_id = field_change.oldValue
                            let object_with_many = store.models[model_name].objects[object_with_many_id]
                            if (object_with_many) {
                                let index = object_with_many[many_field_name].indexOf(foreign_object)
                                if (index > -1) {
                                    if(store.debug) console.log(`many ${model_name}.${many_field_name} of ${object_with_many_id} remove ${foreign_object.id} start`)
                                    object_with_many[many_field_name].splice(index, 1)
                                    if(store.debug) console.log(`many ${model_name}.${many_field_name} of ${object_with_many_id} remove ${foreign_object.id} finish`)
                                }
                            }
                        }
                    })
                    break
                // object was removed 
                case 'remove':
                    foreign_object = change.oldValue
                    object_with_many = store.models[model_name].objects[foreign_object[foreign_id_field_name]]
                    if (object_with_many) {
                        let index = object_with_many[many_field_name].indexOf(foreign_object)
                        if (index > -1) {
                            if(store.debug) console.log(`many ${model_name}.${many_field_name} of ${object_with_many.id} remove ${foreign_object.id} start`)
                            object_with_many[many_field_name].splice(index, 1)
                            if(store.debug) console.log(`many ${model_name}.${many_field_name} of ${object_with_many.id} remove ${foreign_object.id} finish`)
                        }
                    }
                    break
            }
        })
    }
}
