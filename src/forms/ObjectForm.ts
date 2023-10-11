import { Model } from '../model'
import { Input } from '../inputs/Input' 
import { Form } from './Form'

export class ObjectForm extends Form {
    constructor(obj: Model, inputs: {string: Input<any>}) {
        super(
            inputs,
            // TODO: add check input names with obj fields
            () => obj.save(),
            () => obj.cancelLocalChanges()
        )
    }
}
