import { Model } from '../model'
import { QueryPage } from './query-page'


export class ModelQueryPage<M extends Model> extends QueryPage<M> {
    async __load() {
        await super.__load()
        // we have to wait the next tick
        // mobx should finished recalculation for model-objects
        await new Promise(resolve => setTimeout(resolve))
    }
}
