import { EnumInput } from './EnumInput'

describe('EnumInput', () => {
    enum Enum {
        A = 'a',
        B = 1,
    }

    let value = new EnumInput({enum: Enum})

    describe('serialize', () => {
        it('"a"'      , async () => { expect(value.serialize('a'      )).toBe(Enum.A)})
        it('"1"'      , async () => { expect(value.serialize('1'      )).toBe(Enum.B)})
        it('"bad"'    , async () => { expect(value.serialize('bad'    )).toBe(undefined)})
        it('undefined', async () => { expect(value.serialize(undefined)).toBe(undefined) })
        it('null'     , async () => { expect(value.serialize(null     )).toBe(null) })
    })
    describe('deserialize', () => {
        it('Enum.A'   , async () => { expect(value.deserialize(Enum.A       )).toBe('a') })
        it('Enum.B'   , async () => { expect(value.deserialize(Enum.B       )).toBe('1') })
        it('undefined', async () => { expect(value.deserialize(undefined    )).toBe(undefined) })
        it('null'     , async () => { expect(value.deserialize(null         )).toBe('null') })
    })
})
