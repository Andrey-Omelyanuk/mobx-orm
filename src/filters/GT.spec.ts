import { NumberInput } from '../inputs'
import { GT } from './GT'


describe('GT', () => {
    const filter = GT('field', new NumberInput({value: 1}))

    it('URIField', async () => {
        expect(filter.URIField).toBe('field__gt')
    })

    it('operator', async () => {
        expect(filter.operator(1, 2)).toBe(false)
        expect(filter.operator(2, 1)).toBe(true)
        expect(filter.operator(1, 1)).toBe(false)
        expect(filter.operator('a', 'b')).toBe(false)
        expect(filter.operator('b', 'a')).toBe(true)
        expect(filter.operator('a', 'a')).toBe(false)
    })
})
