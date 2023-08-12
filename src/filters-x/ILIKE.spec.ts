import { NumberValue } from '../values'
import { XILIKE as ILIKE } from './ILIKE'

describe('ILIKE', () => {
    const filter = ILIKE('field', new NumberValue(1))

    it('URIField', async () => {
        expect(filter.URIField).toBe('field__icontains')
    })

    it('operator', async () => {
        expect(filter.operator('test one', 'test')).toBe(true)
        expect(filter.operator('test one', 'one' )).toBe(true)
        expect(filter.operator('test one', 'ONE' )).toBe(true)
        expect(filter.operator('test one', 'o'   )).toBe(true)
        expect(filter.operator('test one', 'two' )).toBe(false)
        expect(filter.operator('test one', ''    )).toBe(true)
    })
})
