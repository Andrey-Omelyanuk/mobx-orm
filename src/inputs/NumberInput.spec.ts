import { NumberInput } from './NumberInput'

describe('NumberInput', () => {
    let value = new NumberInput()
    describe('serialize', () => {
        it('"0"'      , async () => { expect(value.serialize('0'      )).toBe(0) })
        it('"test"'   , async () => { expect(value.serialize('test'   )).toBe(undefined) })
        it('"null"'   , async () => { expect(value.serialize('null'   )).toBe(null) })
        it('undefined', async () => { expect(value.serialize(undefined)).toBe(undefined) })
        it('null'     , async () => { expect(value.serialize(null     )).toBe(undefined) })
    })

    describe('deserialize', () => {
        it('"0"'      , async () => { expect(value.deserialize(0        )).toBe('0') })
        it('undefined', async () => { expect(value.deserialize(undefined)).toBe(undefined) })
        it('null'     , async () => { expect(value.deserialize(null     )).toBe('null') })
    })
})
