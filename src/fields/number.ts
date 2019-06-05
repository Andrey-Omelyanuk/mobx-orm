import { observable, intercept } from 'mobx'
import store from '../store'


let type = 'number'

export function registerField() {
    store.registerFieldType(type, (model_name, field_name, obj) => {

        // before changes
        intercept(obj, field_name, (change) => {
            if (change.newValue !== null)
                if (!(change.newValue === Number(change.newValue) && change.newValue % 1 === 0))
                    throw new Error(`Field can be only integer or null.`)
            return change
        })
        // default value
        // if (obj[field_name] === undefined) obj[field_name] = null
    })
}
registerField()


export default function number(cls: any, field_name: string) {
    // It can be wrong name "Function" because we wrapped class in decorator before.
    let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name
    store.registerModelField(model_name, type, field_name)
    // register into mobx
    observable(cls, field_name)
}
