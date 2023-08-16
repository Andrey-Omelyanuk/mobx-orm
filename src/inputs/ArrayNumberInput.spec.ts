import { ArrayNumberInput } from './ArrayNumberInput' 

describe('ArrayNumberInput', () => {
    let value = new ArrayNumberInput()

    describe('serialize', () => {
        it('"0"'      , async () => { expect(value.serialize('0'      )).toMatchObject([0,])})
        it('"0,1,2"'  , async () => { expect(value.serialize('0,1,2'  )).toMatchObject([0,1,2,])})
        it('"test"'   , async () => { expect(value.serialize('test'   )).toMatchObject([])})
        it('"null"'   , async () => { expect(value.serialize('null'   )).toMatchObject([null,]) })
        it('undefined', async () => { expect(value.serialize(undefined)).toMatchObject([]) })
        it('null'     , async () => { expect(value.serialize(null     )).toMatchObject([]) })
    })
    describe('deserialize', () => {
        it('[0]'      , async () => { expect(value.deserialize([0,]      )).toBe('0') })
        it('[0,1,2]'  , async () => { expect(value.deserialize([0,1,2]   )).toBe('0,1,2') })
        it('undefined', async () => { expect(value.deserialize(undefined)).toBe(undefined) })
        it('null'     , async () => { expect(value.deserialize(null     )).toBe(undefined) })
    })
})
