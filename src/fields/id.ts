import { observable, observe, intercept } from 'mobx'
import store from '../store'
import field from './field';


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
            if (change.newValue != null)
                if(obj.id != null)
                    throw new Error(`You cannot change id.`)
                else if (!Number.isInteger(change.newValue))
                    throw new Error(`Id can be only integer or null.`)

            if (obj.id && change.newValue == null)
                store.eject (model_name, obj)

            return change
        })

        // after changes
        observe(obj, field_name, (change) => {
            if (change.newValue)
                store.inject(model_name,obj)
        })

        // default value
        if (obj[field_name] === undefined) obj[field_name] = null
    })
}
registerFieldId()


export default function id(cls: any, field_name: string) {
    // It can be wrong name "Function" because we wrapped class in decorator before.
    let model_name = cls.constructor.name === 'Function' ? cls.prototype.constructor.name : cls.constructor.name
    if (field_name != 'id')
        throw new Error(`id field should named by 'id'`)
    store.registerModelField(model_name, type, field_name)

    // register observable into mobx
    observable(cls, field_name)
}
