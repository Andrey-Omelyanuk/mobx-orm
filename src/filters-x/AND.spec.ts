import { NumberValue } from '..'
import { XAND as AND } from './AND'
import { XEQ as EQ } from './EQ'

describe('AND', () => {
    it('isMatch', () => {
        const a = new NumberValue(1)
        const b = new NumberValue(2)
        const obj_true = { a: 1, b: 2 }
        const obj_false = { a: 1, b: 1 }
         expect(AND(EQ('a', a), EQ('b', b)).isMatch(obj_true)).toBe(true)
         expect(AND(EQ('a', a), EQ('b', b)).isMatch(obj_false)).toBe(false)
    })
})
