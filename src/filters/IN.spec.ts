import { NumberInput } from '../inputs'
import { IN } from './IN'


describe('IN', () => {
    const filter = IN('field', new NumberInput({value: 1}))

    it('URIField', async () => {
        expect(filter.URIField).toBe('field__in')
    })

    it('operator', async () => {
        expect(filter.operator(1, [])).toBe(true)
        expect(filter.operator(1, [1,2,3])).toBe(true)
        expect(filter.operator(1, [2,3])).toBe(false)
    })
})
