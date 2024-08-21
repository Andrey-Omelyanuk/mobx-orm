import _ from 'lodash'
import { OrderByInput } from './OrderByInput'
import { ASC, DESC } from '../queries'

describe('OrderByInput', () => {
    let value = new OrderByInput()
    describe('serialize', () => {
        it('"a"'      , async () => { expect(_.isEqual(value.serialize('a'),     new Map([['a', ASC]]))).toBe(true) })
        it('"a,b"'    , async () => { expect(_.isEqual(value.serialize('a,b'),   new Map([['a', ASC], ['b', ASC]]))).toBe(true) })
        it('"-a"'     , async () => { expect(_.isEqual(value.serialize('-a'),    new Map([['a', DESC]]))).toBe(true) })
        it('"-a,-b"'  , async () => { expect(_.isEqual(value.serialize('-a,-b'), new Map([['a', DESC], ['b', DESC]]))).toBe(true) })
        it('undefined', async () => { expect(_.isEqual(value.serialize(),        new Map([]))).toBe(true) })
    })

    describe('deserialize', () => {
        it('[[a, ASC]]'             , async () => { expect(value.deserialize(new Map([['a', ASC]]))).toBe('a') })
        it('[[a, ASC], [b, ASC]]'   , async () => { expect(value.deserialize(new Map([['a', ASC],['b', ASC]]))).toBe('a,b') })
        it('[[a, DESC]]'            , async () => { expect(value.deserialize(new Map([['a', DESC]]))).toBe('-a') })
        it('[[a, DESC], [b, DESC]]' , async () => { expect(value.deserialize(new Map([['a', DESC],['b', DESC]]))).toBe('-a,-b') })
        it('[]'                     , async () => { expect(value.deserialize(new Map())).toBe(undefined) })
    })
})
