import { NumberValue } from '../value'
import { XIN as IN } from './IN'


describe('IN', () => {
    const filter = IN('field', new NumberValue(1))

    it('URIField', async () => {
        expect(filter.URIField).toBe('field__in')
    })

    it('operator', async () => {
        expect(filter.operator(1, [])).toBe(true)
        expect(filter.operator(1, [1,2,3])).toBe(true)
        expect(filter.operator(1, [2,3])).toBe(false)
    })
})
