import { NumberValue } from '../value'
import { XLT as LT } from './LT'


describe('LT', () => {
    const filter = LT('field', new NumberValue(1))

    it('URIField', async () => {
        expect(filter.URIField).toBe('field__lt')
    })

    it('operator', async () => {
        expect(filter.operator(1, 2)).toBe(true)
        expect(filter.operator(2, 1)).toBe(false)
        expect(filter.operator(1, 1)).toBe(false)
        expect(filter.operator('a', 'b')).toBe(true)
        expect(filter.operator('b', 'a')).toBe(false)
        expect(filter.operator('a', 'a')).toBe(false)
    })
})
