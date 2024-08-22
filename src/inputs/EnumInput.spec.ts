import { EnumInput } from './EnumInput'


describe('EnumInput', () => {

    enum Enum {
        A = 'a',
        B = 1,
    }
    let i = new EnumInput({enum: Enum})

    describe('serialize', () => {
        it('"a"'      , async () => { i.serialize('a'      ); expect(i.value).toBe(Enum.A)})
        it('"1"'      , async () => { i.serialize('1'      ); expect(i.value).toBe(Enum.B)})
        it('"bad"'    , async () => { i.serialize('bad'    ); expect(i.value).toBe(undefined)})
        it('undefined', async () => { i.serialize(undefined); expect(i.value).toBe(undefined) })
        it('null'     , async () => { i.serialize(null     ); expect(i.value).toBe(null) })
    })

    describe('deserialize', () => {
        it('Enum.A'   , async () => { i.set(Enum.A)     ; expect(i.deserialize()).toBe('a') })
        it('Enum.B'   , async () => { i.set(Enum.B)     ; expect(i.deserialize()).toBe('1') })
        it('undefined', async () => { i.set(undefined)  ; expect(i.deserialize()).toBe(undefined) })
        it('null'     , async () => { i.set(null)       ; expect(i.deserialize()).toBe('null') })
    })
})
