import { extendObservable } from 'mobx'
import { stringTo, toString, TYPE } from '../convert'
import { ID } from '../types'


// ------------------------------------------------------------------
// -- Value ---------------------------------------------------------

// ------------------------------------------------------------------
// -- ID ------------------------------------------------------------

export function IdField(props: IdDescriptorProps) {
    const typeDescriptor = new IdDescriptor(props)
    return (cls: any, field_name: string) => {
        let model = cls.constructor
        if (model.__ids === undefined) model.__fields = {}
        model.__ids[field_name] = {
            decorator: (obj) => {
                extendObservable(obj, { [field_name]: obj[field_name] })
            },
            typeDescriptor 
        }
    }
}

// ------------------------------------------------------------------
// -- String --------------------------------------------------------



export function Field<T>(typeDescriptor?: TypeDescriptor<T>) {
    return (cls: any, field_name: string) => {
        let model = cls.constructor
        if (model.__fields === undefined) model.__fields = {}
        model.__fields[field_name] = {
            decorator: (obj) => {
                extendObservable(obj, { [field_name]: obj[field_name] })
            },
            typeDescriptor
        }
    }
}

export function StringField(props?: StringDescriptorProps) {
    const typeDescriptor = new StringDescriptor(props)
    return Field(typeDescriptor)
}

function STRING(props: StringDescriptorProps) {
    return new StringDescriptor(props)
}

Input(STRING({maxLength: 100}), {value: 'test', syncURL: 'search', debounce: 400 })

const searchInput = useInput(STRING({maxLength: 100}), { syncURL: 'search', debounce: 400 })

// ------------------------------------------------------------------
// -- Number --------------------------------------------------------

export function NumberField(props: NumberDescriptorProps) {
    const field = new NumberDescriptor(props)
    return field.decorator 
}

// ------------------------------------------------------------------
// -- Date ----------------------------------------------------------



export function DateField(props?: DateDescriptorProps) {
    const field = new DateDescriptor(props)
    return field.decorator 
}

// ------------------------------------------------------------------
// -- Datetime ------------------------------------------------------

export function DateTimeField(props?: DateDescriptorProps) {
    const field = new DateTimeDescriptor(props)
    return field.decorator 
}

// ------------------------------------------------------------------
// -- Boolean -------------------------------------------------------


export function BooleanField(props?: BooleanDescriptorProps) {
    const field = new BooleanDescriptor(props)
    return field.decorator 
}

// ------------------------------------------------------------------
// -- Example -------------------------------------------------------

class User {
    @IdField({type: TYPE.NUMBER})
    id: number

    @StringField({maxLength: 100})
    name: string

    @NumberField({min: 0, max: 100})
    age: number

    @DateField()
    timestamp: Date 

    @BooleanField()
    is_admin: boolean 
}
