import _ from 'lodash'
import { OrderByInput, ASC, DESC } from '../'


describe('OrderByInput', () => {
    let i = new OrderByInput()

    describe('serialize', () => {
        it('"a"'      , async () => { i.serialize('a')      ; expect(_.isEqual(i.value, new Map([['a', ASC]]))).toBe(true) })
        it('"a,b"'    , async () => { i.serialize('a,b')    ; expect(_.isEqual(i.value, new Map([['a', ASC], ['b', ASC]]))).toBe(true) })
        it('"-a"'     , async () => { i.serialize('-a')     ; expect(_.isEqual(i.value, new Map([['a', DESC]]))).toBe(true) })
        it('"-a,-b"'  , async () => { i.serialize('-a,-b')  ; expect(_.isEqual(i.value, new Map([['a', DESC], ['b', DESC]]))).toBe(true) })
        it('undefined', async () => { i.serialize(undefined); expect(_.isEqual(i.value, new Map([]))).toBe(true) })
    })

    describe('deserialize', () => {
        it('[[a, ASC]]'             , async () => { i.set(new Map([['a', ASC]]))             ; expect(i.deserialize()).toBe('a') })
        it('[[a, ASC], [b, ASC]]'   , async () => { i.set(new Map([['a', ASC],['b', ASC]]))  ; expect(i.deserialize()).toBe('a,b') })
        it('[[a, DESC]]'            , async () => { i.set(new Map([['a', DESC]]))            ; expect(i.deserialize()).toBe('-a') })
        it('[[a, DESC], [b, DESC]]' , async () => { i.set(new Map([['a', DESC],['b', DESC]])); expect(i.deserialize()).toBe('-a,-b') })
        it('[]'                     , async () => { i.set(new Map())                         ; expect(i.deserialize()).toBe(undefined) })
    })
})
