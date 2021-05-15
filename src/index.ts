import { model, Model } from './model'
import Query from './query' 
// adapters
import Adapter from './adapters/adapter'
import { local, LocalAdapter } from './adapters/local'
import { rest, RestAdapter } from './adapters/rest'
// fields
import id               from './fields/id'
import field            from './fields/field'
import foreign          from './fields/foreign'
import one              from './fields/one'
import many             from './fields/many'

export {
    model, Model,
    Query,
    // adapters
    Adapter,
    local, LocalAdapter,
    rest, RestAdapter,
    // fields
    id,
    field,
    foreign,
    one,
    many,
}