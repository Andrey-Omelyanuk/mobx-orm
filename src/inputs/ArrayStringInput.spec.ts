import { ArrayStringInput } from './ArrayStringInput' 


describe('ArrayStringInput', () => {
    let i = new ArrayStringInput()

    describe('serialize', () => {
        it('"a"'      , async () => { i.serialize('a'      ); expect(i.value).toMatchObject(['a',])})
        it('"a,b,2"'  , async () => { i.serialize('a,b,2'  ); expect(i.value).toMatchObject(['a','b','2',])})
        it('"test"'   , async () => { i.serialize('test'   ); expect(i.value).toMatchObject(['test'])})
        it('"null"'   , async () => { i.serialize('null'   ); expect(i.value).toMatchObject([null,]) })
        it('undefined', async () => { i.serialize(undefined); expect(i.value).toMatchObject([]) })
        it('null'     , async () => { i.serialize(null     ); expect(i.value).toMatchObject([]) })
    })

    describe('deserialize', () => {
        it('[a]'      , async () => { i.set(['a',])         ; expect(i.deserialize()).toBe('a') })
        it('[a,b,2]'  , async () => { i.set(['a','b','2'])  ; expect(i.deserialize()).toBe('a,b,2') })
        it('undefined', async () => { i.set(undefined)      ; expect(i.deserialize()).toBe(undefined) })
        it('null'     , async () => { i.set(null)           ; expect(i.deserialize()).toBe(undefined) })
    })
})
