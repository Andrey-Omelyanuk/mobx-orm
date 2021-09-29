import { extendObservable } from 'mobx'



export function field_field(obj, field_name) {
    // make observable and set default value
    extendObservable(obj, {
        // TODO ???
        [field_name]: null
    })
}


export default function field(cls, field_name: string) {
    let model = cls.constructor
    if (model.fields === undefined) model.fields = {}

    model.fields[field_name] = { decorator: field_field }  // register field 
}
