import { observable, observe, intercept } from 'mobx'
import { Model } from '../model'
import store from '../store'


let type = 'id'

/*
1. you can setup id only once!
using obj.id = x, new Obj({id: x}) or obj.save()

2. save() has two behavior depend on id 
 - id === undefined or null -> create object on remote storage and get it
 - id === some number       -> save object in remote storage 

3. if you want just load data to store then you can use this 
new Obj({id: x, ...})
*/

export function registerFieldId() {
    store.registerFieldType(type, (model_name, field_name, obj) => {

        // before changes
        intercept(obj, field_name, (change) => {
            if (change.newValue !== null && obj[field_name] !== null)
                throw new Error(`You cannot change id field: ${field_name}`)

            if (obj[field_name] !== null && change.newValue === null) {
                try {
                    store.eject(obj)
                }
                catch (err) {
                    if (err.name !== `Object with id "${obj.__id}" not exist in the store (model: ${obj.getModelName()}")`)
                        throw err
                }
            }

            return change
        })

        // after changes
        observe(obj, field_name, (change) => {
            // if id is complete
            if (obj.__id !== null) 
                store.inject(obj)
        })

        // default value
        if (obj[field_name] === undefined) obj[field_name] = null
    })
}
registerFieldId()


export default function id(cls: Model, field_name: string) {
    // It can be wrong name "Function" because we wrapped class in decorator before.
    // let model_name = cls.constructor.name === 'Function' ? cls.prototype.constructor.name : cls.constructor.name
    store.registerModelField(cls.getModelName(), type, field_name)
    store.registerId(cls.getModelName(), field_name)
    // register observable into mobx
    observable(cls, field_name)
}
