import { Value, StringValue, NumberValue } from './value'


describe('Value', () => {

    describe('StringValue', () => {
        let value = new StringValue()
        it('serialize "0"'      , async () => { expect(value.serialize('0'      )).toBe('0') })
        it('serialize "test"'   , async () => { expect(value.serialize('test'   )).toBe('test') })
        it('serialize "null"'   , async () => { expect(value.serialize('null'   )).toBe(null) })
        it('serialize undefined', async () => { expect(value.serialize(undefined)).toBe(undefined) })
        it('serialize null'     , async () => { expect(value.serialize(null     )).toBe(null) })

        it('deserialize "0"'      , async () => { expect(value.deserialize('0'      )).toBe('0') })
        it('deserialize "test"'   , async () => { expect(value.deserialize('test'   )).toBe('test') })
        it('deserialize "null"'   , async () => { expect(value.deserialize('null'   )).toBe('null') })
        it('deserialize undefined', async () => { expect(value.deserialize(undefined)).toBe(undefined) })
        it('deserialize null'     , async () => { expect(value.deserialize(null     )).toBe('null') })
    })

    describe('NumberValue', () => {
        let value = new NumberValue()
        it('serialize "0"'      , async () => { expect(value.serialize('0'      )).toBe(0) })
        it('serialize "test"'   , async () => { expect(value.serialize('test'   )).toBe(undefined) })
        it('serialize "null"'   , async () => { expect(value.serialize('null'   )).toBe(null) })
        it('serialize undefined', async () => { expect(value.serialize(undefined)).toBe(undefined) })
        it('serialize null'     , async () => { expect(value.serialize(null     )).toBe(null) })

        it('deserialize "0"'      , async () => { expect(value.deserialize(0        )).toBe('0') })
        it('deserialize undefined', async () => { expect(value.deserialize(undefined)).toBe(undefined) })
        it('deserialize null'     , async () => { expect(value.deserialize(null     )).toBe('null') })
    })
})
