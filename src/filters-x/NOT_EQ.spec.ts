import { NumberInput } from '../inputs'
import { XNOT_EQ as NOT_EQ } from './NOT_EQ'

describe('NOT_EQ', () => {
    const filter = NOT_EQ('field', new NumberInput({value: 1}))

    it('URIField', async () => {
        expect(filter.URIField).toBe('field__not_eq')
    })

    it('operator', async () => {
        expect(filter.operator(1, 2)).toBe(true)
        expect(filter.operator(2, 1)).toBe(true)
        expect(filter.operator(1, 1)).toBe(false)
        expect(filter.operator('a', 'b')).toBe(true)
        expect(filter.operator('b', 'a')).toBe(true)
        expect(filter.operator('a', 'a')).toBe(false)
    })
})
