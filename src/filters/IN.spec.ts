import { IN } from './IN'
import { ValueType } from './SingleFilter'


describe('IN Filter', () => {
    describe('URLField', () => {
        it('A'      , ()=>{ expect(IN('A'    ).URIField).toBe('A__in')})
        it('B'      , ()=>{ expect(IN('B'    ).URIField).toBe('B__in')})
        it('A_B'    , ()=>{ expect(IN('A_B'  ).URIField).toBe('A_B__in')})
        it('A__B'   , ()=>{ expect(IN('A__B' ).URIField).toBe('A__B__in')})
    })

    it('_isMatch', () => {

    })

    describe('Serializer', () => {
        describe('Type: String', () => {
            let f = IN('', [], ValueType.STRING)
            it('undefined'  , ()=>{ f.serialize(undefined ); expect(f.value).toStrictEqual([])})
            it('null'       , ()=>{ f.serialize('null'    ); expect(f.value).toStrictEqual([null])})
            it('10'         , ()=>{ f.serialize('10'      ); expect(f.value).toStrictEqual(['10'])})
            it('text'       , ()=>{ f.serialize('text'    ); expect(f.value).toStrictEqual(['text'])})
            it('true'       , ()=>{ f.serialize('true'    ); expect(f.value).toStrictEqual(['true'])})
            it('false'      , ()=>{ f.serialize('false'   ); expect(f.value).toStrictEqual(['false'])})

            it('10,20,30'   , ()=>{ f.serialize('10,20,30'); expect(f.value).toStrictEqual(['10', '20', '30'])})
            it('A,B,C'      , ()=>{ f.serialize('A,B,C'   ); expect(f.value).toStrictEqual(['A', 'B', 'C'])})
        })
        describe('Type: Number', () => {
            let f = IN('', [], ValueType.NUMBER)
            it('undefined'  , ()=>{ f.serialize(undefined ); expect(f.value).toStrictEqual([])})
            it('null'       , ()=>{ f.serialize('null'    ); expect(f.value).toStrictEqual([null])})
            it('10'         , ()=>{ f.serialize('10'      ); expect(f.value).toStrictEqual([10])})
            it('text'       , ()=>{ f.serialize('text'    ); expect(f.value).toStrictEqual([])})
            it('true'       , ()=>{ f.serialize('true'    ); expect(f.value).toStrictEqual([])})
            it('false'      , ()=>{ f.serialize('false'   ); expect(f.value).toStrictEqual([])})

            it('10,20,30'   , ()=>{ f.serialize('10,20,30'); expect(f.value).toStrictEqual([10, 20, 30])})
            it('A,B,C'      , ()=>{ f.serialize('A,B,C'   ); expect(f.value).toStrictEqual([])})
        })
        describe('Type: Bool', () => {
            let f = IN('', [], ValueType.BOOL)
            it('undefined'  , ()=>{ f.serialize(undefined ); expect(f.value).toStrictEqual([])})
            it('null'       , ()=>{ f.serialize('null'    ); expect(f.value).toStrictEqual([null])})
            it('10'         , ()=>{ f.serialize('10'      ); expect(f.value).toStrictEqual([])})
            it('text'       , ()=>{ f.serialize('text'    ); expect(f.value).toStrictEqual([])})
            it('true'       , ()=>{ f.serialize('true'    ); expect(f.value).toStrictEqual([true])})
            it('false'      , ()=>{ f.serialize('false'   ); expect(f.value).toStrictEqual([false])})

            it('10,20,30'   , ()=>{ f.serialize('10,20,30'); expect(f.value).toStrictEqual([])})
            it('A,B,C'      , ()=>{ f.serialize('A,B,C'   ); expect(f.value).toStrictEqual([])})
        })
    })

    describe('Deserializer', () => {
        describe('Type: String', () => {
            it('undefined'  , ()=>{ expect(IN('', undefined , ValueType.STRING).deserialize()).toBe(undefined)})
            it('null'       , ()=>{ expect(IN('', [null]    , ValueType.STRING).deserialize()).toBe('null')})
            it('null,10'    , ()=>{ expect(IN('', [null, 10], ValueType.STRING).deserialize()).toBe('null,10')})
            it('10'         , ()=>{ expect(IN('', [10]      , ValueType.STRING).deserialize()).toBe('10')})
            it('10,20,30'   , ()=>{ expect(IN('', [10,20,30], ValueType.STRING).deserialize()).toBe('10,20,30')})
            it('text'       , ()=>{ expect(IN('', ['text']  , ValueType.STRING).deserialize()).toBe('text')})
            it('true'       , ()=>{ expect(IN('', [true]    , ValueType.STRING).deserialize()).toBe('true')})
            it('false'      , ()=>{ expect(IN('', [false]   , ValueType.STRING).deserialize()).toBe('false')})
            it('false,true' , ()=>{ expect(IN('', [false, true]   , ValueType.STRING).deserialize()).toBe('false,true')})
        })
        describe('Type: Number', () => {
            it('undefined'  , ()=>{ expect(IN('', undefined , ValueType.NUMBER).deserialize()).toBe(undefined)})
            it('null'       , ()=>{ expect(IN('', [null]    , ValueType.NUMBER).deserialize()).toBe('null')})
            it('null,10'    , ()=>{ expect(IN('', [null, 10], ValueType.NUMBER).deserialize()).toBe('null,10')})
            it('10'         , ()=>{ expect(IN('', [10]      , ValueType.NUMBER).deserialize()).toBe('10')})
            it('10,20,30'   , ()=>{ expect(IN('', [10,20,30], ValueType.NUMBER).deserialize()).toBe('10,20,30')})
            it('text'       , ()=>{ expect(IN('', ['text']  , ValueType.NUMBER).deserialize()).toBe(undefined)})
            it('true'       , ()=>{ expect(IN('', [true]    , ValueType.NUMBER).deserialize()).toBe(undefined)})
            it('false'      , ()=>{ expect(IN('', [false]   , ValueType.NUMBER).deserialize()).toBe(undefined)})
            it('false,true' , ()=>{ expect(IN('', [false, true]   , ValueType.NUMBER).deserialize()).toBe(undefined)})
        })
        describe('Type: Bool', () => {
            it('undefined'  , ()=>{ expect(IN('', undefined , ValueType.BOOL).deserialize()).toBe(undefined)})
            it('null'       , ()=>{ expect(IN('', [null]    , ValueType.BOOL).deserialize()).toBe('null')})
            it('null,10'    , ()=>{ expect(IN('', [null, 10], ValueType.BOOL).deserialize()).toBe('null,true')})
            it('10'         , ()=>{ expect(IN('', [10]      , ValueType.BOOL).deserialize()).toBe('true')})
            it('10,20,30'   , ()=>{ expect(IN('', [10,20,30], ValueType.BOOL).deserialize()).toBe('true,true,true')})
            it('text'       , ()=>{ expect(IN('', ['text']  , ValueType.BOOL).deserialize()).toBe('true')})
            it('true'       , ()=>{ expect(IN('', [true]    , ValueType.BOOL).deserialize()).toBe('true')})
            it('false'      , ()=>{ expect(IN('', [false]   , ValueType.BOOL).deserialize()).toBe('false')})
            it('false,true' , ()=>{ expect(IN('', [false, true]   , ValueType.BOOL).deserialize()).toBe('false,true')})
        })
    })
})