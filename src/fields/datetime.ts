import { observable, intercept } from 'mobx'
import store from '../store'
import { isNoop } from '@babel/types';


let type = 'datetime'

export function registerField() {
    store.registerFieldType(type, (model_name, field_name, obj) => {

        // before changes
        intercept(obj, field_name, (change) => {
            if (change.newValue !== null) {
                if(typeof change.newValue === 'string' || change.newValue instanceof String) {
                    change.newValue = Date.parse(<any>change.newValue)
                    if (!isNaN(change.newValue))
                        change.newValue = new Date(change.newValue)
                }
                if (!(change.newValue instanceof Date)) 
                    throw new Error(`Field can be only Date or null.`)
            }
            return change
        })
    })
}
registerField()


export default function datetime(cls: any, field_name: string) {
    // It can be wrong name "Function" because we wrapped class in decorator before.
    let model_name = cls.constructor.name === 'Function' ? cls.prototype.constructor.name : cls.constructor.name
    store.registerModelField(model_name, type, field_name, {},
        (obj) => { return new Date(obj)     },
        (obj) => { return obj.toISOString() }
    )
    // register into mobx
    observable(cls, field_name)
}
