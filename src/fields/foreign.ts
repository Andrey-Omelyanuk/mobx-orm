import {extendObservable, reaction, action} from 'mobx'


function field_foreign(obj, field_name) {
    let settings = obj.model.__relations[field_name].settings
    let foreign_model   = settings.foreign_model
    let foreign_id_name = settings.foreign_id_name

    // make observable and set default value
    extendObservable(obj, { [field_name]: undefined })

    reaction(
        // watch on foreign cache for foreign object
        () => {
            if (obj[foreign_id_name] === undefined) return undefined
            if (obj[foreign_id_name] === null) return null 
            return foreign_model.__cache.get(obj[foreign_id_name])
        },
        // update foreign field
        action('MO: Foreign - update',
            (_new, _old) => obj[field_name] = _new 
        ),
        {fireImmediately: true}
    )
}

export function foreign(foreign_model: any, foreign_id_name?: string) {
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
