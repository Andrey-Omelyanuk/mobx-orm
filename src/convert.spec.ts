import { TYPE, toString, stringTo } from './convert'
import { ASC, DESC } from './types'


describe('Convert', () => {
    describe('stringTo', () => {
        it('STRING', async () => {
            expect(stringTo(TYPE.STRING, '0'        )).toBe('0')
            expect(stringTo(TYPE.STRING, 'test'     )).toBe('test')
            expect(stringTo(TYPE.STRING, 'null'     )).toBe(null)
            expect(stringTo(TYPE.STRING, undefined  )).toBe(undefined)
            expect(stringTo(TYPE.STRING, null       )).toBe(null)
        })
        it('NUMBER', async () => {
            expect(stringTo(TYPE.NUMBER, '0'        )).toBe(0)
            expect(stringTo(TYPE.NUMBER, 'test'     )).toBe(undefined)
            expect(stringTo(TYPE.NUMBER, 'null'     )).toBe(null)
            expect(stringTo(TYPE.NUMBER, undefined  )).toBe(undefined)
            expect(stringTo(TYPE.NUMBER, null       )).toBe(null)
        })
        it('DATE', async () => {
        })
        it('DATETIME', async () => {
        })
        it('BOOLEAN', async () => {
        })
        it('ARRAY_STRING', async () => {
            expect(stringTo(TYPE.ARRAY_STRING, 'a'      )).toMatchObject(['a',])
            expect(stringTo(TYPE.ARRAY_STRING, 'a,b,2'  )).toMatchObject(['a','b','2',])
            expect(stringTo(TYPE.ARRAY_STRING, 'test'   )).toMatchObject(['test'])
            expect(stringTo(TYPE.ARRAY_STRING, 'null'   )).toMatchObject([null,])
            expect(stringTo(TYPE.ARRAY_STRING, undefined)).toMatchObject([])
            expect(stringTo(TYPE.ARRAY_STRING, null     )).toMatchObject([])
        })
        it('ARRAY_NUMBER', async () => {
            expect(stringTo(TYPE.ARRAY_NUMBER, '0'      )).toMatchObject([0,])
            expect(stringTo(TYPE.ARRAY_NUMBER, '0,1,2'  )).toMatchObject([0,1,2,])
            expect(stringTo(TYPE.ARRAY_NUMBER, 'test'   )).toMatchObject([])
            expect(stringTo(TYPE.ARRAY_NUMBER, 'null'   )).toMatchObject([null,])
            expect(stringTo(TYPE.ARRAY_NUMBER, undefined)).toMatchObject([])
            expect(stringTo(TYPE.ARRAY_NUMBER, null     )).toMatchObject([])
        })
        it('ARRAY_DATE', async () => {
        })
        it('ARRAY_DATETIME', async () => {
        })
        it('ORDER_BY', async () => {
            expect(stringTo(TYPE.ORDER_BY, 'a'      )).toMatchObject(new Map([['a', ASC]]))
            expect(stringTo(TYPE.ORDER_BY, 'a,b'    )).toMatchObject(new Map([['a', ASC], ['b', ASC]]))
            expect(stringTo(TYPE.ORDER_BY, '-a'     )).toMatchObject(new Map([['a', DESC]]))
            expect(stringTo(TYPE.ORDER_BY, '-a,-b'  )).toMatchObject(new Map([['a', DESC], ['b', DESC]]))
            expect(stringTo(TYPE.ORDER_BY, undefined)).toMatchObject(new Map([]))
            
//         it('"a"'      , async () => { i.serialize('a')      ; expect(_.isEqual(i.value, new Map([['a', ASC]]))).toBe(true) })
//         it('"a,b"'    , async () => { i.serialize('a,b')    ; expect(_.isEqual(i.value, new Map([['a', ASC], ['b', ASC]]))).toBe(true) })
//         it('"-a"'     , async () => { i.serialize('-a')     ; expect(_.isEqual(i.value, new Map([['a', DESC]]))).toBe(true) })
//         it('"-a,-b"'  , async () => { i.serialize('-a,-b')  ; expect(_.isEqual(i.value, new Map([['a', DESC], ['b', DESC]]))).toBe(true) })
//         it('undefined', async () => { i.serialize(undefined); expect(_.isEqual(i.value, new Map([]))).toBe(true) })
        })
    })

    describe('toString', () => {
        it('STRING', async () => {
            expect(toString(TYPE.STRING, '0'        )).toBe('0')
            expect(toString(TYPE.STRING, 'test'     )).toBe('test')
            expect(toString(TYPE.STRING, 'null'     )).toBe('null')
            expect(toString(TYPE.STRING, undefined  )).toBe(undefined)
            expect(toString(TYPE.STRING, null       )).toBe('null')
        })
        it('NUMBER', async () => {
            expect(toString(TYPE.NUMBER, 0        )).toBe('0')
            // expect(toString(TYPE.NUMBER, 'test'   )).toBe(undefined)
            expect(toString(TYPE.NUMBER, null     )).toBe('null')
            expect(toString(TYPE.NUMBER, undefined)).toBe(undefined)
        })
        it('DATE', async () => {
        })
        it('DATETIME', async () => {
        })
        it('BOOLEAN', async () => {
        })
        it('ARRAY_STRING', async () => {
            expect(toString(TYPE.ARRAY_STRING, ['a',]       )).toBe('a')
            expect(toString(TYPE.ARRAY_STRING, ['a','b','2'])).toBe('a,b,2')
            expect(toString(TYPE.ARRAY_STRING, undefined    )).toBe(undefined)
            expect(toString(TYPE.ARRAY_STRING, null         )).toBe(undefined)
        })
        it('ARRAY_NUMBER', async () => {
            expect(toString(TYPE.ARRAY_NUMBER, [0,]       )).toBe('0')
            expect(toString(TYPE.ARRAY_NUMBER, [0,1,2]    )).toBe('0,1,2')
            expect(toString(TYPE.ARRAY_NUMBER, undefined  )).toBe(undefined)
            expect(toString(TYPE.ARRAY_NUMBER, null       )).toBe(undefined)
        })
        it('ARRAY_DATE', async () => {
        })
        it('ARRAY_DATETIME', async () => {
        })
        it('ORDER_BY', async () => {
            expect(toString(TYPE.ORDER_BY, new Map([['a', ASC]])             )).toBe('a')
            expect(toString(TYPE.ORDER_BY, new Map([['a', ASC],['b', ASC]]  ))).toBe('a,b')
            expect(toString(TYPE.ORDER_BY, new Map([['a', DESC]])            )).toBe('-a')
            expect(toString(TYPE.ORDER_BY, new Map([['a', DESC],['b', DESC]]))).toBe('-a,-b')
            expect(toString(TYPE.ORDER_BY, new Map()                         )).toBe(undefined)
        })
    })
})
