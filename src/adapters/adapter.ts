import { Model } from '../model'


export default interface Adapter {
    save  : (obj: Model)=> Promise<Model> 
    delete: (obj: Model)=> Promise<Model>
    load  : (where, order_by, limit, offset) => Promise<Model[]>
}
