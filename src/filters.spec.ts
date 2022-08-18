import { reaction, runInAction } from 'mobx'
import { EQ, NOT_EQ, IN, AND, Filter, ValueType } from './filters'

// TODO: move these tests

describe('Filters', () => {

    describe('declare', () => {
        it('IN', () => {
            expect(IN('A'    )).toMatchObject({field: 'A'    , value: []})
            expect(IN('A', [])).toMatchObject({field: 'A'    , value: []})
            expect(IN('A', [1,2,3])).toMatchObject({field:'A', value: [1,2,3]})
        })
    })

    describe('edit', () => {
        it('IN', () => {
            let f = IN('A', [1])
            runInAction(() => f.value.push(2)   ); expect(f).toMatchObject({field: 'A', value: [1, 2]})
            runInAction(() => f.value = [3]     ); expect(f).toMatchObject({field: 'A', value: [3]})
        })
    })

    describe('is_match', () => {
        it('IN', () => {
            expect(IN('A', [1,2,3]).isMatch({A: 1})).toBe(true)
            expect(IN('A', [1,2,3]).isMatch({A: 2})).toBe(true)
            expect(IN('A', [1,2,3]).isMatch({A: 3})).toBe(true)
            expect(IN('A', [1,2,3]).isMatch({A: 4})).toBe(false)
            expect(IN('A', [1,2,3]).isMatch({A: 1})).toBe(true)
            expect(IN('A', [1,2,3]).isMatch({B: 1})).toBe(false)
            expect(IN('A', [2,3,4]).isMatch({A: 1})).toBe(false)
            expect(IN('A', []     ).isMatch({A: 1})).toBe(true)
            expect(IN('A'         ).isMatch({A: 1})).toBe(true)
            expect(IN('A', ['2']  ).isMatch({A: 2})).toBe(false)
            expect(IN('A__B__C', [1]).isMatch({A: {B: {C: 1}}})).toBe(true)
            expect(IN('A__B__C', [1]).isMatch({A: {B: {C: 2}}})).toBe(false)
            expect(IN('A__B__C', [1,2]).isMatch({A: {B: {C: 2}}})).toBe(true)
            expect(IN('A__B__C', [1]).isMatch({A: {B: {}}})).toBe(false)
            expect(IN('A__B__C', [1,2]).isMatch({A: {B: null}})).toBe(false)
            expect(IN('A__B__C', [1,2]).isMatch({A: {B: undefined}})).toBe(false)
            expect(IN('A__B__C', [1]).isMatch({A: {}})).toBe(false)
        })
        it('AND', () => {
            expect(AND(EQ('A', 1), EQ('B', 1)).isMatch({A: 1, B: 1})).toBe(true)
            expect(AND(EQ('A', 1), EQ('B', 1)).isMatch({A: 1, B: 2})).toBe(false)
            expect(AND(EQ('A', 1), EQ('B', 1)).isMatch({A: 2, B: 1})).toBe(false)
            expect(AND(EQ('A', 2), EQ('B', 1)).isMatch({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('B', 2)).isMatch({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('C', 1)).isMatch({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('C', 1)).isMatch({A: 2, B: 2})).toBe(false)
            expect(AND(EQ('A'), EQ('A', 1)).isMatch({A: 1, B: 2})).toBe(true)
            expect(AND(EQ('A'), EQ('A', 2)).isMatch({A: 1, B: 2})).toBe(false)
            expect(AND(                   ).isMatch({A: 1, B: 2})).toBe(true)
        })
    })

    describe('EQ.setFromURI', () => {
        describe('Default value: Undefined, Type value: STRING', () => {
            let f
            beforeEach(() => { f = EQ('A', undefined, ValueType.STRING) })
            it('A__eq=bar'      , () => { f.setFromURI("A__eq=bar"      ); expect(f).toMatchObject({field: 'A', value: 'bar'}) })
            it('A__eq=123'      , () => { f.setFromURI("A__eq=123"      ); expect(f).toMatchObject({field: 'A', value: '123'}) })
            it('A__eq=null'     , () => { f.setFromURI("A__eq=null"     ); expect(f).toMatchObject({field: 'A', value: null}) })
            it('A__eq=a&A__eq=b', () => { f.setFromURI("A__eq=a&A__eq=b"); expect(f).toMatchObject({field: 'A', value: 'a'}) })
            it('B__eq=a&A__eq=b', () => { f.setFromURI("B__eq=a&A__eq=b"); expect(f).toMatchObject({field: 'A', value: 'b'}) })
            it('empty'          , () => { f.setFromURI(""               ); expect(f).toMatchObject({field: 'A', value: undefined}) })
            it('B__eq=xxx'      , () => { f.setFromURI("B__eq=xxx"      ); expect(f).toMatchObject({field: 'A', value: undefined}) })
            it('A___eq=xxx'     , () => { f.setFromURI("A___eq=xxx"     ); expect(f).toMatchObject({field: 'A', value: undefined}) })
            it('A_eq=xxx'       , () => { f.setFromURI("A_eq=xxx"       ); expect(f).toMatchObject({field: 'A', value: undefined}) })
            it('Aeq=xxx'        , () => { f.setFromURI("Aeq=xxx"        ); expect(f).toMatchObject({field: 'A', value: undefined}) })
            it('A=xxx'          , () => { f.setFromURI("A=xxx"          ); expect(f).toMatchObject({field: 'A', value: undefined}) })
        })
        describe('Default value: "xxx", Type value: STRING', () => {
            let f
            beforeEach(() => { f = EQ('A', 'xxx', ValueType.STRING) })
            it('A__eq=bar'      , () => { f.setFromURI("A__eq=bar"      ); expect(f).toMatchObject({field: 'A', value: 'bar'}) })
            it('A__eq=123'      , () => { f.setFromURI("A__eq=123"      ); expect(f).toMatchObject({field: 'A', value: '123'}) })
            it('A__eq=null'     , () => { f.setFromURI("A__eq=null"     ); expect(f).toMatchObject({field: 'A', value: null}) })
            it('A__eq=a&A_eq=b' , () => { f.setFromURI("A__eq=a&A__eq=b"); expect(f).toMatchObject({field: 'A', value: 'a'}) })
            it('empty'          , () => { f.setFromURI(""               ); expect(f).toMatchObject({field: 'A', value: undefined}) })
            it('B__eq=xxx'      , () => { f.setFromURI("B__eq=xxx"      ); expect(f).toMatchObject({field: 'A', value: undefined}) })
        })
    })
    describe('IN.setFromURI', () => {
        describe('Default value: Undefined, Type value: STRING', () => {
            let f
            beforeEach(() => { f = IN('A', undefined, ValueType.STRING) })
            it('A__in=bar'      , () => { f.setFromURI("A__in=bar"      ); expect(f).toMatchObject({field: 'A', value: ['bar']}) })
            it('A__in=1%2C2%2C3', () => { f.setFromURI("A__in=1%2C2%2C3"); expect(f).toMatchObject({field: 'A', value: ['1','2','3']}) })
            it('A__in=1,2,3'    , () => { f.setFromURI("A__in=1,2,3"    ); expect(f).toMatchObject({field: 'A', value: ['1','2','3']}) })
            it('A__in=null'     , () => { f.setFromURI("A__in=null"     ); expect(f).toMatchObject({field: 'A', value: [null]}) })
            it('A__in=a&A__in=b', () => { f.setFromURI("A__in=a&A__in=b"); expect(f).toMatchObject({field: 'A', value: ['a']}) })
            it('B__in=a&A__in=b', () => { f.setFromURI("B__in=a&A__in=b"); expect(f).toMatchObject({field: 'A', value: ['b']}) })
            it('empty'          , () => { f.setFromURI(""               ); expect(f).toMatchObject({field: 'A', value: []}) })
            it('B__in=xxx'      , () => { f.setFromURI("B__in=xxx"      ); expect(f).toMatchObject({field: 'A', value: []}) })
            it('A___in=xxx'     , () => { f.setFromURI("A___in=xxx"     ); expect(f).toMatchObject({field: 'A', value: []}) })
            it('A_in=xxx'       , () => { f.setFromURI("A_in=xxx"       ); expect(f).toMatchObject({field: 'A', value: []}) })
            it('Ain=xxx'        , () => { f.setFromURI("Ain=xxx"        ); expect(f).toMatchObject({field: 'A', value: []}) })
            it('A=xxx'          , () => { f.setFromURI("A=xxx"        ); expect(f).toMatchObject({field: 'A', value: []}) })
        })
        describe('Default value: ["a", "b"], Type value: STRING', () => {
            let f
            beforeEach(() => { f = IN('A', ['a', 'b'], ValueType.STRING) })
            it('A__in=bar'      , () => { f.setFromURI("A__in=bar"      ); expect(f).toMatchObject({field: 'A', value: ['bar']}) })
            it('A__in=1,2,3'    , () => { f.setFromURI("A__in=1,2,3"    ); expect(f).toMatchObject({field: 'A', value: ['1','2','3']}) })
            it('A__in=null'     , () => { f.setFromURI("A__in=null"     ); expect(f).toMatchObject({field: 'A', value: [null]}) })
            it('A__in=a&A__in=b', () => { f.setFromURI("A__in=a&A__in=b"); expect(f).toMatchObject({field: 'A', value: ['a']}) })
            it('empty'          , () => { f.setFromURI(""               ); expect(f).toMatchObject({field: 'A', value: []}) })
            it('B__in=xxx'      , () => { f.setFromURI("B__eq=xxx"      ); expect(f).toMatchObject({field: 'A', value: []}) })
        })
    })

    describe('AND.setFromURI', () => {
        it('...', () => {
            let f
            f = AND(); f.setFromURI("A__in=bar&foo=baz"); expect(f).toMatchObject({filters: []})
            f = AND(IN('A')         ); f.setFromURI("A__in=bar&foo=baz"); expect(f).toMatchObject({filters: [{field: 'A', value: ['bar']}]})
            f = AND(IN('A'), EQ('B')); f.setFromURI("A__in=1&B__eq=2"  ); expect(f).toMatchObject({filters: [{field: 'A', value: ['1']}, {field: 'B', value: '2'}]})
        })
    })

    it('ValueType.NUMBER', () => {
        let f
        f = EQ('A', undefined, ValueType.NUMBER); f.setFromURI("A__eq=2&foo=baz");   expect(f).toMatchObject({field: 'A', value: 2})
        f = EQ('A', undefined, ValueType.NUMBER); f.setFromURI("A=bar&foo=baz");     expect(f).toMatchObject({field: 'A', value: undefined})
        f = EQ('A', undefined, ValueType.NUMBER); f.setFromURI("");                  expect(f).toMatchObject({field: 'A', value: undefined})
        f = EQ('A', undefined, ValueType.NUMBER); f.setFromURI("A__eq=1&A__eq=2");   expect(f).toMatchObject({field: 'A', value: 1  })
        f = EQ('A', undefined, ValueType.NUMBER); f.setFromURI("A__in=1&A__eq=2");   expect(f).toMatchObject({field: 'A', value: 2  })
        f = EQ('A', undefined, ValueType.NUMBER); f.setFromURI("A__in=1%2C2%2C3");   expect(f).toMatchObject({field: 'A', value: undefined})

        f = IN('A', undefined, ValueType.NUMBER); f.setFromURI("A__in=bar&foo=baz"); expect(f).toMatchObject({field: 'A', value: []})
        f = IN('A', undefined, ValueType.NUMBER); f.setFromURI("A__in=1%2C2");       expect(f).toMatchObject({field: 'A', value: [1, 2]})
        f = IN('A', undefined, ValueType.NUMBER); f.setFromURI("");                  expect(f).toMatchObject({field: 'A', value: []})
        f = IN('A', undefined, ValueType.NUMBER); f.setFromURI("A__in=3%2C4&A__in=1%2C2&"); expect(f).toMatchObject({field: 'A', value: [3, 4] })

        f = AND(); f.setFromURI("A__in=bar&foo=baz"); expect(f).toMatchObject({filters: []})

        f = AND(IN('A', undefined, ValueType.NUMBER)); f.setFromURI("A__in=1&foo=baz"); expect(f).toMatchObject({filters: [{field: 'A', value: [1]}]})
        f = AND(IN('A', undefined, ValueType.NUMBER), EQ('B', undefined, ValueType.NUMBER)); f.setFromURI("A__in=1&B__eq=2"  ); expect(f).toMatchObject({filters: [{field: 'A', value: [1]}, {field: 'B', value: 2}]})
    })

    it('ValueType.BOOL', () => {
        let f
        f = EQ('A', undefined, ValueType.BOOL); f.setFromURI("A__eq=true&foo=baz");   expect(f).toMatchObject({field: 'A', value: true})
        f = EQ('A', undefined, ValueType.BOOL); f.setFromURI("A=true&foo=baz");       expect(f).toMatchObject({field: 'A', value: undefined})
        f = EQ('A', undefined, ValueType.BOOL); f.setFromURI("");                     expect(f).toMatchObject({field: 'A', value: undefined})
        f = EQ('A', undefined, ValueType.BOOL); f.setFromURI("A__eq=true&A__eq=false");   expect(f).toMatchObject({field: 'A', value: true })
        f = EQ('A', undefined, ValueType.BOOL); f.setFromURI("A__in=true&A__eq=false");  expect(f).toMatchObject({field: 'A', value: false })
        f = EQ('A', undefined, ValueType.BOOL); f.setFromURI("A__in=1%2C2%2C3");      expect(f).toMatchObject({field: 'A', value: undefined})

        f = IN('A', undefined, ValueType.BOOL); f.setFromURI("A__in=bar&foo=baz");    expect(f).toMatchObject({field: 'A', value: []})
        f = IN('A', undefined, ValueType.BOOL); f.setFromURI("A__in=true%2Cfalse");   expect(f).toMatchObject({field: 'A', value: [true, false]})
        f = IN('A', undefined, ValueType.BOOL); f.setFromURI("");                     expect(f).toMatchObject({field: 'A', value: []})
        f = IN('A', undefined, ValueType.BOOL); f.setFromURI("A__in=true%2Ctrue&A__in=false%2Cfalse&"); expect(f).toMatchObject({field: 'A', value: [true, true] })

        f = AND(); f.setFromURI("A__in=bar&foo=baz"); expect(f).toMatchObject({filters: []})

        f = AND(IN('A', undefined, ValueType.BOOL)); f.setFromURI("A__in=true&foo=baz"); expect(f).toMatchObject({filters: [{field: 'A', value: [true]}]})
        f = AND(IN('A', undefined, ValueType.BOOL), EQ('B', undefined, ValueType.BOOL)); f.setFromURI("A__in=true&B__eq=false"  ); expect(f).toMatchObject({filters: [{field: 'A', value: [true]}, {field: 'B', value: false}]})
    })

    it('toURISearchParams', () => {
        expect(EQ('A', 1).URLSearchParams.toString()).toBe('A__eq=1')
        expect(EQ('B', 2).URLSearchParams.toString()).toBe('B__eq=2')
        expect(EQ('A').URLSearchParams.toString()).toBe('')

        expect(IN('A', [1,2,3]).URLSearchParams.toString()).toBe('A__in=1%2C2%2C3')
        expect(IN('B', [3]    ).URLSearchParams.toString()).toBe('B__in=3')
        expect(IN('B', []     ).URLSearchParams.toString()).toBe('')
        expect(IN('A').URLSearchParams.toString()).toBe('')

        expect(AND(EQ('A', 1), EQ('B', 2)       ).URLSearchParams.toString()).toBe('A__eq=1&B__eq=2')
        expect(AND(EQ('A', 1), IN('C', [1,2,3]) ).URLSearchParams.toString()).toBe('A__eq=1&C__in=1%2C2%2C3')
        expect(AND(EQ('A', 1), IN('C')          ).URLSearchParams.toString()).toBe('A__eq=1')
        expect(AND(EQ('A'   ), IN('B')          ).URLSearchParams.toString()).toBe('')
    })
})
