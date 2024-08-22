import { StringInput } from './StringInput'


describe('StringValue', () => {
    let i = new StringInput()

    describe('serialize', () => {
        it('"0"'      , async () => { i.serialize('0'      ); expect(i.value).toBe('0') })
        it('"test"'   , async () => { i.serialize('test'   ); expect(i.value).toBe('test') })
        it('"null"'   , async () => { i.serialize('null'   ); expect(i.value).toBe(null) })
        it('undefined', async () => { i.serialize(undefined); expect(i.value).toBe(undefined) })
        it('null'     , async () => { i.serialize(null     ); expect(i.value).toBe(undefined) })
    })

    describe('deserialize', () => {
        it('"0"'      , async () => { i.set('0')        ; expect(i.deserialize()).toBe('0') })
        it('"test"'   , async () => { i.set('test')     ; expect(i.deserialize()).toBe('test') })
        it('"null"'   , async () => { i.set('null')     ; expect(i.deserialize()).toBe('null') })
        it('undefined', async () => { i.set(undefined)  ; expect(i.deserialize()).toBe(undefined) })
        it('null'     , async () => { i.set(null)       ; expect(i.deserialize()).toBe('null') })
    })
})
