import { NumberValue } from '../values'
import { XLIKE as LIKE } from './LIKE'

describe('LIKE', () => {
    const filter = LIKE('field', new NumberValue({value: 1}))

    it('URIField', async () => {
        expect(filter.URIField).toBe('field__contains')
    })

    it('operator', async () => {
        expect(filter.operator('test one', 'test')).toBe(true)
        expect(filter.operator('test one', 'one' )).toBe(true)
        expect(filter.operator('test one', 'ONE' )).toBe(false)
        expect(filter.operator('test one', 'o'   )).toBe(true)
        expect(filter.operator('test one', 'two' )).toBe(false)
        expect(filter.operator('test one', ''    )).toBe(true)
    })
})
