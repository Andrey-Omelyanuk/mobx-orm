import { model, Model } from './model'
import QueryBase from './query-base' 
import Query from './query' 
import QueryPage from './query-page' 
// adapters
import Adapter from './adapters/adapter'
import { local, LocalAdapter } from './adapters/local'
// import { rest, RestAdapter } from './adapters/rest'
// fields
import id               from './fields/id'
import field            from './fields/field'
import foreign          from './fields/foreign'
import one              from './fields/one'
import many             from './fields/many'

export {
    model, Model,
    QueryBase,
    Query,
    QueryPage,
    // adapters
    Adapter,
    local, LocalAdapter,
    // rest, RestAdapter,
    // fields
    id,
    field,
    foreign,
    one,
    many,
}