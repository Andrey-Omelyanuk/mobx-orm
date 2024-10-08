import { NumberInput } from '../inputs'
import { EQ, EQV } from './EQ'


describe('EQ', () => {
    const filter = EQ('field', new NumberInput({value: 1}))

    it('URIField', async () => {
        expect(filter.URIField).toBe('field')
    })

    it('operator', async () => {
        expect(filter.operator(1, 2)).toBe(false)
        expect(filter.operator(2, 1)).toBe(false)
        expect(filter.operator(1, 1)).toBe(true)
        expect(filter.operator('a', 'b')).toBe(false)
        expect(filter.operator('b', 'a')).toBe(false)
        expect(filter.operator('a', 'a')).toBe(true)
    })
})

describe('EQV', () => {
    const filter = EQV('field', new NumberInput({value: 1}))

    it('URIField', async () => {
        expect(filter.URIField).toBe('field__eq')
    })

    it('operator', async () => {
        expect(filter.operator(1, 2)).toBe(false)
        expect(filter.operator(2, 1)).toBe(false)
        expect(filter.operator(1, 1)).toBe(true)
        expect(filter.operator('a', 'b')).toBe(false)
        expect(filter.operator('b', 'a')).toBe(false)
        expect(filter.operator('a', 'a')).toBe(true)
    })
})