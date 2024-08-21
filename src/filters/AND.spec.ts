import { NumberInput } from '..'
import { AND } from './AND'
import { EQ } from './EQ'


describe('AND', () => {
    it('isMatch', () => {
        const a = new NumberInput({value: 1})
        const b = new NumberInput({value: 2})
        const obj_true = { a: 1, b: 2 }
        const obj_false = { a: 1, b: 1 }
         expect(AND(EQ('a', a), EQ('b', b)).isMatch(obj_true)).toBe(true)
         expect(AND(EQ('a', a), EQ('b', b)).isMatch(obj_false)).toBe(false)
    })
})
