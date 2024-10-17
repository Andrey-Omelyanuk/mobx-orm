import { runInAction } from 'mobx'
import { Model, NumberInput, local } from '..'
import { ObjectInput } from '../inputs' 
import { SingleFilter, EQ, EQV, NOT_EQ, GT, GTE, LT, LTE, LIKE, ILIKE, IN } from './SingleFilter'


describe('SingleFilter', () => {
    @local()
    class TestModel extends Model {}

    it('isReady', () => {
        const options = TestModel.getQuery({})
        const input =  new ObjectInput({value: 1, options})
        const filter = new SingleFilter('test', input, () => `test`, (a: any, b: any) => a === b)
                                                            ; expect(options.isReady).toBe(true)
                                                            ; expect(input  .isReady).toBe(true)
                                                            ; expect(filter .isReady).toBe(true)

        runInAction(() => options.isNeedToUpdate = true)    ; expect(options.isReady).toBe(false)
                                                            ; expect(input  .isReady).toBe(false)
                                                            ; expect(filter .isReady).toBe(false)

        runInAction(() => options.isNeedToUpdate = false)   ; expect(options.isReady).toBe(true)
                                                            ; expect(input  .isNeedToUpdate).toBe(true)
                                                            ; expect(input  .isReady).toBe(false)

        input.set(2)                                        ; expect(input  .isReady).toBe(true)
                                                            ; expect(filter .isReady).toBe(true)
    })

    it('URLSearchParams', () => {
        const input =  NumberInput({value: 1})
        const filter = new SingleFilter('test', input, () => `test-x`, (a: any, b: any) => a === b)
                            ; expect(filter.URLSearchParams.toString()).toBe('test-x=1')
        input.set(null)     ; expect(filter.URLSearchParams.toString()).toBe('test-x=null')
        input.set(undefined); expect(filter.URLSearchParams.toString()).toBe('')
    })

    it('isMatch', () => {
        // TODO: implement
    })

    describe('EQ', () => {
        const filter = EQ('field', NumberInput({value: 1}))
        it('URIField', async () => {
            expect(filter.getURIField(filter.field)).toBe('field')
        })
        it('operator', async () => {
            expect(filter.operator(1, 2)).toBe(false)
            expect(filter.operator(2, 1)).toBe(false)
            expect(filter.operator(1, 1)).toBe(true)
            expect(filter.operator('a', 'b')).toBe(false)
            expect(filter.operator('b', 'a')).toBe(false)
            expect(filter.operator('a', 'a')).toBe(true)
        })
    })

    describe('EQV', () => {
        const filter = EQV('field', NumberInput({value: 1}))
        it('URIField', async () => {
            expect(filter.getURIField(filter.field)).toBe('field__eq')
        })
        it('operator', async () => {
            expect(filter.operator(1, 2)).toBe(false)
            expect(filter.operator(2, 1)).toBe(false)
            expect(filter.operator(1, 1)).toBe(true)
            expect(filter.operator('a', 'b')).toBe(false)
            expect(filter.operator('b', 'a')).toBe(false)
            expect(filter.operator('a', 'a')).toBe(true)
        })
    })

    describe('NOT_EQ', () => {
        const filter = NOT_EQ('field', NumberInput({value: 1}))
        it('URIField', async () => {
            expect(filter.getURIField(filter.field)).toBe('field__not_eq')
        })
        it('operator', async () => {
            expect(filter.operator(1, 2)).toBe(true)
            expect(filter.operator(2, 1)).toBe(true)
            expect(filter.operator(1, 1)).toBe(false)
            expect(filter.operator('a', 'b')).toBe(true)
            expect(filter.operator('b', 'a')).toBe(true)
            expect(filter.operator('a', 'a')).toBe(false)
        })
    })

    describe('GT', () => {
        const filter = GT('field', NumberInput({value: 1}))
        it('URIField', async () => {
            expect(filter.getURIField(filter.field)).toBe('field__gt')
        })
        it('operator', async () => {
            expect(filter.operator(1, 2)).toBe(false)
            expect(filter.operator(2, 1)).toBe(true)
            expect(filter.operator(1, 1)).toBe(false)
            expect(filter.operator('a', 'b')).toBe(false)
            expect(filter.operator('b', 'a')).toBe(true)
            expect(filter.operator('a', 'a')).toBe(false)
        })
    })

    describe('GTE', () => {
        const filter = GTE('field', NumberInput({value: 1}))
        it('URIField', async () => {
            expect(filter.getURIField(filter.field)).toBe('field__gte')
        })
        it('operator', async () => {
            expect(filter.operator(1, 2)).toBe(false)
            expect(filter.operator(2, 1)).toBe(true)
            expect(filter.operator(1, 1)).toBe(true)
            expect(filter.operator('a', 'b')).toBe(false)
            expect(filter.operator('b', 'a')).toBe(true)
            expect(filter.operator('a', 'a')).toBe(true)
        })
    })

    describe('LT', () => {
        const filter = LT('field', NumberInput({value: 1}))
        it('URIField', async () => {
            expect(filter.getURIField(filter.field)).toBe('field__lt')
        })
        it('operator', async () => {
            expect(filter.operator(1, 2)).toBe(true)
            expect(filter.operator(2, 1)).toBe(false)
            expect(filter.operator(1, 1)).toBe(false)
            expect(filter.operator('a', 'b')).toBe(true)
            expect(filter.operator('b', 'a')).toBe(false)
            expect(filter.operator('a', 'a')).toBe(false)
        })
    })

    describe('LTE', () => {
        const filter = LTE('field', NumberInput({value: 1}))
        it('URIField', async () => {
            expect(filter.getURIField(filter.field)).toBe('field__lte')
        })
        it('operator', async () => {
            expect(filter.operator(1, 2)).toBe(true)
            expect(filter.operator(2, 1)).toBe(false)
            expect(filter.operator(1, 1)).toBe(true)
            expect(filter.operator('a', 'b')).toBe(true)
            expect(filter.operator('b', 'a')).toBe(false)
            expect(filter.operator('a', 'a')).toBe(true)
        })
    })

    describe('LIKE', () => {
        const filter = LIKE('field', NumberInput({value: 1}))
        it('URIField', async () => {
            expect(filter.getURIField(filter.field)).toBe('field__contains')
        })
        it('operator', async () => {
            expect(filter.operator('test one', 'test')).toBe(true)
            expect(filter.operator('test one', 'one' )).toBe(true)
            expect(filter.operator('test one', 'ONE' )).toBe(false)
            expect(filter.operator('test one', 'o'   )).toBe(true)
            expect(filter.operator('test one', 'two' )).toBe(false)
            expect(filter.operator('test one', ''    )).toBe(true)
        })
    })

    describe('ILIKE', () => {
        const filter = ILIKE('field', NumberInput({value: 1}))
        it('URIField', async () => {
            expect(filter.getURIField(filter.field)).toBe('field__icontains')
        })
        it('operator', async () => {
            expect(filter.operator('test one', 'test')).toBe(true)
            expect(filter.operator('test one', 'one' )).toBe(true)
            expect(filter.operator('test one', 'ONE' )).toBe(true)
            expect(filter.operator('test one', 'o'   )).toBe(true)
            expect(filter.operator('test one', 'two' )).toBe(false)
            expect(filter.operator('test one', ''    )).toBe(true)
        })
    })

    describe('IN', () => {
        const filter = IN('field', NumberInput({value: 1}))
        it('URIField', async () => {
            expect(filter.getURIField(filter.field)).toBe('field__in')
        })
        it('operator', async () => {
            expect(filter.operator(1, [])).toBe(true)
            expect(filter.operator(1, [1,2,3])).toBe(true)
            expect(filter.operator(1, [2,3])).toBe(false)
        })
    })
})
