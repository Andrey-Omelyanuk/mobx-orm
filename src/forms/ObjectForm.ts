import { Model } from '../model'
import { Input } from '../inputs/Input' 
import { Form } from './Form'


export class ObjectForm<M extends Model> extends Form {
    obj: M
    constructor(inputs: {string: Input<any, any>}, ) {
        super(
            inputs,
            () => {
                if (!this.obj) {
                    throw new Error('ObjectForm error: obj is not set')
                }
                // move all values from inputs to obj
                for (let fieldName of Object.keys(inputs)) {
                    this.obj[fieldName] = inputs[fieldName].value
                }
                return this.obj.save()
            },
            () => {}
        )
    }

    setObj(obj: M) {
        this.obj = obj
        for (let fieldName of Object.keys(this.inputs)) {
            if (!obj.hasOwnProperty(fieldName)) {
                console.error(`ObjectForm error: object has no field ${fieldName}`, obj) 
            }
        }
    }
}
