import { ArrayStringInput } from './ArrayStringInput' 

describe('ArrayStringInput', () => {
    let value = new ArrayStringInput()

    describe('serialize', () => {
        it('"a"'      , async () => { expect(value.serialize('a'      )).toMatchObject(['a',])})
        it('"a,b,2"'  , async () => { expect(value.serialize('a,b,2'  )).toMatchObject(['a','b','2',])})
        it('"test"'   , async () => { expect(value.serialize('test'   )).toMatchObject(['test'])})
        it('"null"'   , async () => { expect(value.serialize('null'   )).toMatchObject([null,]) })
        it('undefined', async () => { expect(value.serialize(undefined)).toMatchObject([]) })
        it('null'     , async () => { expect(value.serialize(null     )).toMatchObject([]) })
    })
    describe('deserialize', () => {
        it('[a]'      , async () => { expect(value.deserialize(['a',]       )).toBe('a') })
        it('[a,b,2]'  , async () => { expect(value.deserialize(['a','b','2'])).toBe('a,b,2') })
        it('undefined', async () => { expect(value.deserialize(undefined    )).toBe(undefined) })
        it('null'     , async () => { expect(value.deserialize(null         )).toBe(undefined) })
    })
})
