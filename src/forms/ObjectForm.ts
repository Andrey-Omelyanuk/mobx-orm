import { Model } from '../model'
import { Input } from '../inputs/Input' 
import { Form } from './Form'


export class ObjectForm<M extends Model> extends Form {
    obj: M
    constructor(inputs: { [key: string]: Input<any, any> }, onSubmitted?: (obj: M) => void , onCancelled?: () => void) {
        super(
            inputs,
            async () => {
                if (!this.obj) {
                    // console.error('ObjectForm error: obj is not set', this)
                    throw new Error('ObjectForm error: obj is not set')
                }
                const fieldsNames = Object.keys(this.obj)
                for (let fieldName of Object.keys(this.inputs)) {
                    if (!fieldsNames.includes(fieldName)) {
                        // console.error(`ObjectForm error: object has no field ${fieldName}`, this)
                        throw new Error(`ObjectForm error: object has no field ${fieldName}`)
                    }
                }

                // move all values from inputs to obj
                for (let fieldName of Object.keys(inputs)) {
                    this.obj[fieldName] = inputs[fieldName].value
                }
                const response = await this.obj.save()
                if (onSubmitted)
                    onSubmitted(response)
            },
            onCancelled
        )
    }
}
