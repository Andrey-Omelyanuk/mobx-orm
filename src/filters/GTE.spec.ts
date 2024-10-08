import { NumberInput } from '../inputs'
import { GTE } from './GTE'


describe('GTE', () => {
    const filter = GTE('field', new NumberInput({value: 1}))

    it('URIField', async () => {
        expect(filter.URIField).toBe('field__gte')
    })

    it('operator', async () => {
        expect(filter.operator(1, 2)).toBe(false)
        expect(filter.operator(2, 1)).toBe(true)
        expect(filter.operator(1, 1)).toBe(true)
        expect(filter.operator('a', 'b')).toBe(false)
        expect(filter.operator('b', 'a')).toBe(true)
        expect(filter.operator('a', 'a')).toBe(true)
    })
})
