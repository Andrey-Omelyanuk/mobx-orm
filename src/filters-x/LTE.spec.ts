import { NumberValue } from '../value'
import { XLTE as LTE } from './LTE'


describe('LTE', () => {
    const filter = LTE('field', new NumberValue(1))

    it('URIField', async () => {
        expect(filter.URIField).toBe('field__lte')
    })

    it('operator', async () => {
        expect(filter.operator(1, 2)).toBe(true)
        expect(filter.operator(2, 1)).toBe(false)
        expect(filter.operator(1, 1)).toBe(true)
        expect(filter.operator('a', 'b')).toBe(true)
        expect(filter.operator('b', 'a')).toBe(false)
        expect(filter.operator('a', 'a')).toBe(true)
    })
})
