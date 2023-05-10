import { Model } from '../model'
import { Query } from './query'


export class ModelQuery<M extends Model> extends Query<M> {
    async __load() {
        await super.__load()
        // we have to wait the next tick
        // mobx should finished recalculation for model-objects
        await new Promise(resolve => setTimeout(resolve))
    }
}
