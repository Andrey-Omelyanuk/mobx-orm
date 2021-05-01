import { observable, observe, intercept, extendObservable } from 'mobx'

/*
1. you can setup id only once!
using obj.id = x, new Obj({id: x}) or obj.save()

2. save() has two behavior depend on id 
 - id === undefined or null -> create object on remote storage and get it
 - id === some number       -> save object in remote storage 

3. if you want just load data to cache then you can use this 
new Obj({id: x, ...})
*/

function field_ID (obj , field_name) {
    debugger
    // make observable and set default value
    extendObservable(obj, {
        [field_name]: null 
    })

    // before changes
    intercept(obj, field_name, (change) => {
        if (change.newValue !== null && obj[field_name] !== null)
            throw new Error(`You cannot change id field: ${field_name}. ${obj[field_name]} ${change.newValue}`)
        if (obj[field_name] !== null && change.newValue === null) {
            try {
                obj.eject()
            }
            catch (err) {
                let ignore_error = `Object with id "${obj.__id}" not exist in the model cache: ${obj.model.name}")`
                if (err.name !== ignore_error)
                    throw err
            }
        }
        return change
    })

    // after changes
    observe(obj, field_name, (change) => {
        // if id is complete
        if (obj.__id !== null) 
            obj.inject()
    })

}


export default function id(cls, field_name: string) {
    let model = cls.constructor
    model.initModel(model)                              // init model if was not inited
    model.fields[field_name] = { decorator: field_ID }  // register field 
    model.ids.push(field_name)                          // register id

    // TODO ??? is it necessary?
    // observable(model, field_name)
    // we have to observe cache
    // observable(model, 'cache')
}
