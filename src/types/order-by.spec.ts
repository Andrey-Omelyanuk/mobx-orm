import { ASC, DESC, OrderByDescriptor } from './order-by'


describe('OrderByDescriptor', () => {
    const desc = new OrderByDescriptor()

    describe('toString', () => {
        it('"a" ASC => "a"'        , () => { expect(desc.toString(['a', ASC])).toBe('a') })
        it('"b" DESC => "-b"'      , () => { expect(desc.toString(['b', DESC])).toBe('-b') })
        it('"" ASC => undefined'   , () => { expect(desc.toString(['', ASC])).toBe(undefined) })
        it('"" DESC => undefined'  , () => { expect(desc.toString(['', DESC])).toBe(undefined) })
        it('null ASC => undefined' , () => { expect(desc.toString([null, ASC])).toBe(undefined) })
        it('undefined ASC => undefined', () => { expect(desc.toString([undefined, ASC])).toBe(undefined) })
        it('undefined => undefined', () => { expect(desc.toString(undefined)).toBe(undefined) })
        it('null => undefined'     , () => { expect(desc.toString(null)).toBe(undefined) })
    })

    // expect(stringTo(TYPE.ORDER_BY, undefined)).toMatchObject(new Map([]))

    describe('fromString', () => {
        it('"a" => a ASC'          , () => { expect(desc.fromString('a')).toEqual(['a', ASC]) })
        it('"-b" => b DESC'        , () => { expect(desc.fromString('-b')).toEqual(['b', DESC]) })
        it('"null" => null ASC'    , () => { expect(desc.fromString('null')).toEqual(['null', ASC]) })
        it('"" => undefined'       , () => { expect(desc.fromString('')).toBe(undefined) })
        it('null => undefined'     , () => { expect(desc.fromString(null)).toBe(undefined) })
        it('undefined => undefined', () => { expect(desc.fromString(undefined)).toBe(undefined) })
    })

    // describe('validate', () => {
    //     it('null', async () => {
    //         const descriptor = new StringDescriptor({null: true})
    //         expect(() => descriptor.validate(null)).not.toThrow()
    //     })
    //     it('not null', async () => {
    //         const descriptor = new StringDescriptor({null: false})
    //         expect(() => descriptor.validate(null)).toThrow()
    //     })
    //     it('required', async () => {
    //         const descriptor = new StringDescriptor({required: true})
    //         expect(() => descriptor.validate('')).toThrow('Field is required')
    //     })
    //     it('not required', async () => {
    //         const descriptor = new StringDescriptor({required: false})
    //         expect(() => descriptor.validate('')).not.toThrow()
    //     })
    //     it('maxLength', async () => {
    //         const descriptor = new StringDescriptor({maxLength: 5})
    //         expect(() => descriptor.validate('12345')).not.toThrow()
    //         expect(() => descriptor.validate('123456')).toThrow('String is too long')
    //     })
    // })
})
