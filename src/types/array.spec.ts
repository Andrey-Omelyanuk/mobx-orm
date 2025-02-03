import { ArrayDescriptor } from './array'
import { StringDescriptor } from './string'
import { NumberDescriptor } from './number'
import { ASC, DESC, OrderByDescriptor } from './order-by'


describe('ArrayDescriptor', () => {
    const descStr = new ArrayDescriptor(new StringDescriptor())
    const descNum = new ArrayDescriptor(new NumberDescriptor())
    const descOrder = new ArrayDescriptor(new OrderByDescriptor())
    describe('toString', () => {
        it('null => undefined'          , () => { expect(descStr.toString(null)).toBe(undefined) })
        it('undefined => undefined'     , () => { expect(descStr.toString(undefined)).toBe(undefined) })
        it('[] => undefined'            , () => { expect(descStr.toString([])).toBe(undefined) })
        it('["a"] => "a"'               , () => { expect(descStr.toString(['a'])).toBe('a') })
        it('["a", "b", "c"] => "a,b,c"' , () => { expect(descStr.toString(['a', 'b', 'c'])).toBe('a,b,c') })
        it('[1, 2, 3] => "1,2,3"'       , () => { expect(descNum.toString([1, 2, 3])).toBe('1,2,3') })
        it('[["a", ASC], ["b", DESC]] => "a,-b"',
            () => { expect(descOrder.toString([["a", ASC], ["b", DESC]])).toBe('a,-b') })
    })

    describe('fromString', () => {
        it('undefined => []'            , () => { expect(descStr.fromString(undefined)).toEqual([]) })
        it('null=> []'                  , () => { expect(descStr.fromString(null)).toEqual([]) })
        it('"" => []'                   , () => { expect(descStr.fromString('')).toEqual([]) })
        it('"a" => ["a"]'               , () => { expect(descStr.fromString('a')).toEqual(['a']) })
        it('"a,b,c" => ["a", "b", "c"]' , () => { expect(descStr.fromString('a,b,c')).toEqual(['a','b','c']) })
        it('"1,2,3" => [1, 2, 3]'       , () => { expect(descNum.fromString('1,2,3')).toEqual([1, 2, 3]) })
        it('"a,-b" => [["a", ASC], ["b", DESC]]',
            () => { expect(descOrder.fromString('a,-b')).toEqual([["a", ASC], ["b", DESC]]) })
    })

    describe('constructor', () => {

        it('default', () => {
            const desc = new ArrayDescriptor(new StringDescriptor())
            expect(desc.config).toEqual({ type: new StringDescriptor() })
        })
        it('props', () => {
            const desc = new ArrayDescriptor(new StringDescriptor(), { minItems: 1, maxItems: 10 })
            expect(desc.config).toEqual({ type: new StringDescriptor(), minItems: 1, maxItems: 10 })
        })
    })

    // TODO: test validate
    describe('validate', () => {
        it('null', async () => {
        })
    })
})
