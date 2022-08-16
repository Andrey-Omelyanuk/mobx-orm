import { IN } from './IN'
import { ValueType } from './SingleFilter'


describe('IN Filter', () => {
    describe('URLField', () => {
        it('A'      , ()=>{ expect(IN('A'    ).URIField).toBe('A__in')})
        it('B'      , ()=>{ expect(IN('B'    ).URIField).toBe('B__in')})
        it('A_B'    , ()=>{ expect(IN('A_B'  ).URIField).toBe('A_B__in')})
        it('A__B'   , ()=>{ expect(IN('A__B' ).URIField).toBe('A__B__in')})
    })

    describe('operator', () => {
        it('null      in [null, 1, 2]'      , ()=>{ expect(IN('A', []).operator(null        , [null, 1, 2])).toBe(true ) })
        it('undefined in [1, 2, undefined]' , ()=>{ expect(IN('A', []).operator(undefined   , [1, 2, undefined])).toBe(true ) })
        it('"111"     in [1, "111", null]'  , ()=>{ expect(IN('A', []).operator('111'       , [1, '111', null])).toBe(true ) })
        it('3         in [1, 3, null]'      , ()=>{ expect(IN('A', []).operator(3           , [1, 3, null])).toBe(true ) })
        it('true      in [1, true, 2]'      , ()=>{ expect(IN('A', []).operator(true        , [1, true, 2])).toBe(true ) })

        it('null      not in [1, 2, ]'  , ()=>{ expect(IN('A', []).operator(null        , [1, 2, ])).toBe(false) })
        it('undefined not in [1, 2, ]'  , ()=>{ expect(IN('A', []).operator(undefined   , [1, 2, ])).toBe(false) })
        it('"111"     not in [1, 2, ]'  , ()=>{ expect(IN('A', []).operator('111'       , [1, 2, ])).toBe(false) })
        it('3         not in [1, 2, ]'  , ()=>{ expect(IN('A', []).operator(3           , [1, 2, ])).toBe(false) })
        it('true      not in [1, 2, ]'  , ()=>{ expect(IN('A', []).operator(true        , [1, 2, ])).toBe(false) })
    })

    describe('isMatch', () => {
        let tests = [
            ['A', [null], {A: null}, true],
            ['A', [null], {A: undefined}, false],
            ['A', [null], {A: 1}, false],
            ['A', [undefined], {}, true],
            ['A', [undefined], {A: 1}, false],
            ['A', [1], {A: 1}, true],
            ['A', [2], {A: 1}, false],
            ['A', [1], {B: 1}, false],
            ['A', [1, 2, 3], {A: 2}, true],

            ['A__B', [1], {A: [{B: 1}, {B: 4}]}, true],
            ['A__B', [4], {A: [{B: 1}, {B: 4}]}, true],
            ['A__B', [1], {A: [{B: 2}, {B: 4}]}, false],
            ['A__B', [1], {A: [{C: 1}, {C: 4}]}, false],
            ['A__B', [1], {A: []}, false],
            ['A__B', [1, 2, 3], {A: [{B: 1}, {B: 4}]}, true],

            ['A__B__C', [1], {}, false],
            ['A__B__C', [1], {A: {}}, false],
            ['A__B__C', [1], {A: {B: {}}}, false],
            ['A__B__C', [1], {A: {B: {C: 1}}}, true],
            ['A__B__C', [1], {A: {B: {C: 2}}}, false],
            ['A__B__C', [null], {A: {B: {C: 1   }}}, false],
            ['A__B__C', [null], {A: {B: {C: null}}}, true],
            ['A__B__C', [true], {A: {B: {C: true}}}, true],
            ['A__B__C', [true], {A: {B: {C: false}}}, false],
            ['A__B__C', [true], {A: {B: {C: 1}}}, false],

            ['A__B__C', [1], {A: [ {B: {C: 0}}, {C: 1} ]}, false],
            ['A__B__C', [1], {A: [ {B: {C: 1}}, {C: 1} ]}, true],

            ['A__B__C',     [1], {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C',     [2], {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C',     [3], {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, false],
            ['A__B__C',   ['3'], {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, false],
            ['A__B__C',  [true], {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C', [false], {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, false],

            // Note: filter with undefined value should return true always, it's like filter is disabled
            ['A__B__C', undefined, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C', undefined, {A: [{B: [{C: 1}, {C: true},   ]}, {B: [{C: 2}, {C: null} ]}]}, true],
        ]

        for (const test of tests) {
            let [field, value, obj, isMatch] = test
            it(`${field}, ${JSON.stringify(value)} ${isMatch? '===' : '!=='} ${JSON.stringify(obj)}`, () => {
                expect(IN(field as any, value as any).isMatch(obj)).toBe(isMatch)
            })
        }
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