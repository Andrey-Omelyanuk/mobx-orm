import { Model } from '../model'
import { Repository }  from '../repository'
import { Adapter } from './adapter'


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
export function constant (constant: any[]) {
    return (cls: any) => {
        let repository = new Repository(cls, new ConstantAdapter(constant)) 
        cls.__proto__.repository = repository
    }
}
