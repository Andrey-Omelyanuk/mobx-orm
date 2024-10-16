import { TYPE, toString, stringTo } from './convert'


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
        })
        it('ARRAY_NUMBER', async () => {
        })
        it('ARRAY_DATE', async () => {
        })
        it('ARRAY_DATETIME', async () => {
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
        })
        it('ARRAY_NUMBER', async () => {
        })
        it('ARRAY_DATE', async () => {
        })
        it('ARRAY_DATETIME', async () => {
        })
    })
})

// describe('ArrayNumberInput', () => {
//     let i = new ArrayNumberInput()

//     describe('serialize', () => {
//         it('"0"'      , async () => { i.serialize('0'      ); expect(i.value).toMatchObject([0,])})
//         it('"0,1,2"'  , async () => { i.serialize('0,1,2'  ); expect(i.value).toMatchObject([0,1,2,])})
//         it('"test"'   , async () => { i.serialize('test'   ); expect(i.value).toMatchObject([])})
//         it('"null"'   , async () => { i.serialize('null'   ); expect(i.value).toMatchObject([null,]) })
//         it('undefined', async () => { i.serialize(undefined); expect(i.value).toMatchObject([]) })
//         it('null'     , async () => { i.serialize(null     ); expect(i.value).toMatchObject([]) })
//     })

//     describe('deserialize', () => {
//         it('[0]'      , async () => { i.set([0,])       ; expect(i.deserialize()).toBe('0') })
//         it('[0,1,2]'  , async () => { i.set([0,1,2])    ; expect(i.deserialize()).toBe('0,1,2') })
//         it('undefined', async () => { i.set(undefined)  ; expect(i.deserialize()).toBe(undefined) })
//         it('null'     , async () => { i.set(null)       ; expect(i.deserialize()).toBe(undefined) })
//     })
// })

// describe('ArrayStringInput', () => {
//     let i = new ArrayStringInput()

//     describe('serialize', () => {
//         it('"a"'      , async () => { i.serialize('a'      ); expect(i.value).toMatchObject(['a',])})
//         it('"a,b,2"'  , async () => { i.serialize('a,b,2'  ); expect(i.value).toMatchObject(['a','b','2',])})
//         it('"test"'   , async () => { i.serialize('test'   ); expect(i.value).toMatchObject(['test'])})
//         it('"null"'   , async () => { i.serialize('null'   ); expect(i.value).toMatchObject([null,]) })
//         it('undefined', async () => { i.serialize(undefined); expect(i.value).toMatchObject([]) })
//         it('null'     , async () => { i.serialize(null     ); expect(i.value).toMatchObject([]) })
//     })

//     describe('deserialize', () => {
//         it('[a]'      , async () => { i.set(['a',])         ; expect(i.deserialize()).toBe('a') })
//         it('[a,b,2]'  , async () => { i.set(['a','b','2'])  ; expect(i.deserialize()).toBe('a,b,2') })
//         it('undefined', async () => { i.set(undefined)      ; expect(i.deserialize()).toBe(undefined) })
//         it('null'     , async () => { i.set(null)           ; expect(i.deserialize()).toBe(undefined) })
//     })
// })

// describe('OrderByInput', () => {
//     let i = new OrderByInput()

//     describe('serialize', () => {
//         it('"a"'      , async () => { i.serialize('a')      ; expect(_.isEqual(i.value, new Map([['a', ASC]]))).toBe(true) })
//         it('"a,b"'    , async () => { i.serialize('a,b')    ; expect(_.isEqual(i.value, new Map([['a', ASC], ['b', ASC]]))).toBe(true) })
//         it('"-a"'     , async () => { i.serialize('-a')     ; expect(_.isEqual(i.value, new Map([['a', DESC]]))).toBe(true) })
//         it('"-a,-b"'  , async () => { i.serialize('-a,-b')  ; expect(_.isEqual(i.value, new Map([['a', DESC], ['b', DESC]]))).toBe(true) })
//         it('undefined', async () => { i.serialize(undefined); expect(_.isEqual(i.value, new Map([]))).toBe(true) })
//     })

//     describe('deserialize', () => {
//         it('[[a, ASC]]'             , async () => { i.set(new Map([['a', ASC]]))             ; expect(i.deserialize()).toBe('a') })
//         it('[[a, ASC], [b, ASC]]'   , async () => { i.set(new Map([['a', ASC],['b', ASC]]))  ; expect(i.deserialize()).toBe('a,b') })
//         it('[[a, DESC]]'            , async () => { i.set(new Map([['a', DESC]]))            ; expect(i.deserialize()).toBe('-a') })
//         it('[[a, DESC], [b, DESC]]' , async () => { i.set(new Map([['a', DESC],['b', DESC]])); expect(i.deserialize()).toBe('-a,-b') })
//         it('[]'                     , async () => { i.set(new Map())                         ; expect(i.deserialize()).toBe(undefined) })
//     })
// })