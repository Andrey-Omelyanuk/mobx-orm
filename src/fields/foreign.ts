import {intercept, observe, extendObservable, reaction} from 'mobx'


function field_foreign(obj, field_name) {
    let edit_mode = false
    let settings = obj.model.__relations[field_name].settings
    let foreign_model   = settings.foreign_model
    let foreign_id_name = settings.foreign_id_name

    // make observable and set default value
    extendObservable(obj, { [field_name]: undefined })

    reaction(
        // watch on foreign cache for foreign object
        () => {
            if (obj.id === undefined) return undefined
            if (obj.id === null) return null 
            return foreign_model.__cache.get(obj.id)
        },
        // update foreign field
        (foreign_obj, prev, reaction) => {
            obj[field_name] = foreign_obj
        }
    )

    // Setter
    // 1. checks before set new changes
    intercept(obj, field_name, (change) => {
        if (change.newValue !== null && !(change.newValue.model == foreign_model)) {
            throw new Error(`You can set only instance of "${foreign_model.name}" or null`)
        }
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
            // if foreign set to value then update foreign_id on the obj
            if (change.newValue === undefined || change.newValue === null) {
                obj[foreign_id_name] = change.newValue 
            }
            else {
                obj[foreign_id_name]  = change.newValue.id
            }
            edit_mode = false
        }
        catch(e) {
            // rollback changes!
            if (change.oldValue === undefined || change.oldValue === null) {
                obj[foreign_id_name] = change.oldValue 
            }
            else {
                obj[foreign_id_name]  = change.oldValue.id
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

export default function foreign(foreign_model: any, foreign_id_name?: string) {
    foreign_model = foreign_model.__proto__ // TODO: band-aid
    return function (cls: any, field_name: string) {
        let model = cls.constructor
        if (model.__relations === undefined) model.__relations = {}
        // register field 
        model.__relations[field_name] = { 
            decorator: field_foreign,
            settings: {
                foreign_model: foreign_model,
                // if it is empty then try auto detect it (it works only with single id) 
                foreign_id_name: foreign_id_name !== undefined ? foreign_id_name : `${field_name}_id`
            } 
        } 
    }
}
