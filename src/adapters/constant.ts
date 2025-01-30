import { Model } from '../model'
import { Repository }  from '../repository'
import { Adapter } from './adapter'

/**
 * ConstantAdapter is an adapter that uses a constant array of objects.
 * It is useful for testing and development or when the data is static and does not change.
 * For example, a list of countries or a list of categories.
 */
export class ConstantAdapter<M extends Model> extends Adapter<M> {
    readonly constant: any[] 

    constructor (constant) {
        super()
        this.constant = constant
    }

    async action (): Promise<any> {
        console.warn('ConstantAdapter.action not implemented')
        return {} 
    }

    async create (): Promise<any> {
        throw new Error('ConstantAdapter.create should not be used.')
    }

    async update (): Promise<any> {
        throw new Error('ConstantAdapter.update should not be used.')
    }

    async delete (): Promise<void> {
        throw new Error('ConstantAdapter.delete should not be used.')
    }

    async get (): Promise<any> {
        throw new Error('ConstantAdapter.get should not be used.')
    }

    async find (): Promise<any> {
        throw new Error('ConstantAdapter.find should not be used.')
    }

    async load (): Promise<any[]> {
        return this.constant 
    }

    async getTotalCount (): Promise<number> {
        return this.constant.length
    }

    async getDistinct (): Promise<any[]> {
        throw new Error('ConstantAdapter.getDistinct should not be used.')
    }

    getURLSearchParams(): URLSearchParams {
        return new URLSearchParams()
        // throw new Error('ConstantAdapter.getURLSearchParams should not be used.')
    }
}

// model decorator
// export function constant (constant: any[]) {
//     return (cls: any) => {
//         let repository = new Repository(cls, new ConstantAdapter(constant)) 
//         cls.__proto__.repository = repository
//     }
// }


export function constant (constant: any[]) {
    return function (
        constructor: any, 
        context: ClassDecoratorContext
    ) {
        context.addInitializer(function () {
            console.warn(constructor.getModelDescription)
            console.warn(constructor.prototype)
            console.warn(constructor.prototype.getModelDescription)
            console.warn(constructor.prototype.prototype)
        })
        // let repository = new Repository(constructor, new ConstantAdapter(constant)) 
        // constructor.getModelDescription().repository = repository
    }

}
