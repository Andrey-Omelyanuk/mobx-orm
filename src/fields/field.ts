import { extendObservable } from 'mobx'


export function field_field(obj, field_name) {
    // make observable and set default value
    extendObservable(obj, { [field_name]: obj[field_name] })
}

export function field(cls, field_name: string) {
    let model = cls.constructor
    if (model.__fields === undefined) model.__fields = {}

    model.__fields[field_name] = { decorator: field_field }  // register field 
}
