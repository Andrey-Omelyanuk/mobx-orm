import { StringInput } from './StringInput'

describe('StringValue', () => {
    let value = new StringInput()
    describe('serialize', () => {
        it('"0"'      , async () => { expect(value.serialize('0'      )).toBe('0') })
        it('"test"'   , async () => { expect(value.serialize('test'   )).toBe('test') })
        it('"null"'   , async () => { expect(value.serialize('null'   )).toBe(null) })
        it('undefined', async () => { expect(value.serialize(undefined)).toBe(undefined) })
        it('null'     , async () => { expect(value.serialize(null     )).toBe(null) })
    })
    describe('deserialize', () => {
        it('"0"'      , async () => { expect(value.deserialize('0'      )).toBe('0') })
        it('"test"'   , async () => { expect(value.deserialize('test'   )).toBe('test') })
        it('"null"'   , async () => { expect(value.deserialize('null'   )).toBe('null') })
        it('undefined', async () => { expect(value.deserialize(undefined)).toBe(undefined) })
        it('null'     , async () => { expect(value.deserialize(null     )).toBe('null') })
    })
})
