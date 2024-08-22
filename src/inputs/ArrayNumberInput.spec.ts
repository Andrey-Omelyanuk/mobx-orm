import { ArrayNumberInput } from './ArrayNumberInput' 


describe('ArrayNumberInput', () => {
    let i = new ArrayNumberInput()

    describe('serialize', () => {
        it('"0"'      , async () => { i.serialize('0'      ); expect(i.value).toMatchObject([0,])})
        it('"0,1,2"'  , async () => { i.serialize('0,1,2'  ); expect(i.value).toMatchObject([0,1,2,])})
        it('"test"'   , async () => { i.serialize('test'   ); expect(i.value).toMatchObject([])})
        it('"null"'   , async () => { i.serialize('null'   ); expect(i.value).toMatchObject([null,]) })
        it('undefined', async () => { i.serialize(undefined); expect(i.value).toMatchObject([]) })
        it('null'     , async () => { i.serialize(null     ); expect(i.value).toMatchObject([]) })
    })

    describe('deserialize', () => {
        it('[0]'      , async () => { i.set([0,])       ; expect(i.deserialize()).toBe('0') })
        it('[0,1,2]'  , async () => { i.set([0,1,2])    ; expect(i.deserialize()).toBe('0,1,2') })
        it('undefined', async () => { i.set(undefined)  ; expect(i.deserialize()).toBe(undefined) })
        it('null'     , async () => { i.set(null)       ; expect(i.deserialize()).toBe(undefined) })
    })
})
