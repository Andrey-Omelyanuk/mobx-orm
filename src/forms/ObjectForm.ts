import { Model } from '../model'
import { Input } from '../inputs/Input' 
import { Form } from './Form'

export class ObjectForm extends Form {
    constructor(obj: Model, inputs: {string: Input<any>}) {
        super(
            inputs,
            () => obj.save(),
            () => obj.cancelLocalChanges()
        )
    }
}
