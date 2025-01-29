import { Model } from '@/model'
import { extendObservable } from 'mobx'


export function field_field(obj, field_name) {
    // make observable and set default value
    extendObservable(obj, { [field_name]: obj[field_name] })
}

// export function field(cls, field_name: string) {
//     let model = cls.constructor
//     if (model.__fields === undefined) model.__fields = {}
//     model.__fields[field_name] = { decorator: field_field }  // register field 
// }


export function field(
    value,
    context: ClassFieldDecoratorContext<Model, string|number|boolean>
) {

    // context.addInitializer
    context.addInitializer(function () {
        // let model = this.constructor as any
        console.warn(this.constructor)
        let model = this.constructor as any
        // let model = this.__getModel()
        if (model.__fields === undefined) model.__fields = {}
        model.__fields[context.name] = { decorator: field_field }  // register field 
        field_field(this, context.name)
        console.warn(model)
    })
}

// type Decorator =
//   | ClassDecorator
//   | ClassMethodDecorator
//   | ClassGetterDecorator
//   | ClassSetterDecorator
//   | ClassAutoAccessorDecorator
//   | ClassFieldDecorator

// type Decorator = (
//   value: DecoratedValue, // only fields differ
//   context: {
//     kind: string;
//     name: string | symbol;
//     addInitializer(initializer: () => void): void;

//     // Don’t always exist:
//     static: boolean;
//     private: boolean;
//     access: {get: () => unknown, set: (value: unknown) => void};
//   }
// ) => void | ReplacementValue; // only fields differ
