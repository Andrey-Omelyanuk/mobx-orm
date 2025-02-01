import { NumberDescriptor } from './number'


describe('NumberDescriptor', () => {

    describe('toString', () => {
        it('0 => "0"'              , () => { expect((new NumberDescriptor()).toString(0)).toBe('0') })
        it('123 => "123"'          , () => { expect((new NumberDescriptor()).toString(123)).toBe('123') })
        it('null => "null"'        , () => { expect((new NumberDescriptor()).toString(null)).toBe('null') })
        it('undefined => undefined', () => { expect((new NumberDescriptor()).toString(undefined)).toBe(undefined) })
    })

    describe('fromString', () => {
        it('"0" => 0'              , () => { expect((new NumberDescriptor()).fromString('0')).toBe(0) })
        it('"123" => 123'          , () => { expect((new NumberDescriptor()).fromString('123')).toBe(123) })
        it('"test" => undefined'   , () => { expect((new NumberDescriptor()).fromString('test')).toBe(undefined) })
        it('"null" => null'        , () => { expect((new NumberDescriptor()).fromString('null')).toBe(null) })
        it('null => null'          , () => { expect((new NumberDescriptor()).fromString(null)).toBe(null) })
        it('undefined => undefined', () => { expect((new NumberDescriptor()).fromString(undefined)).toBe(undefined) })
    })

    describe('validate', () => {
        it('null', async () => {
            const descriptor = new NumberDescriptor({null: true})
            expect(() => descriptor.validate(null)).not.toThrow()
        })
        it('not null', async () => {
            const descriptor = new NumberDescriptor({null: false})
            expect(() => descriptor.validate(null)).toThrow('Field is required')
        })
        it('min', async () => {
            const descriptor = new NumberDescriptor({min: 5})
            expect(() => descriptor.validate(5)).not.toThrow()
            expect(() => descriptor.validate(4)).toThrow('Number is too small')
        })
        it('max', async () => {
            const descriptor = new NumberDescriptor({max: 10})
            expect(() => descriptor.validate(10)).not.toThrow()
            expect(() => descriptor.validate(11)).toThrow('Number is too big')
        })
    })
})
