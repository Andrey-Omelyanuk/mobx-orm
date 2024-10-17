import { Model, Query, StringInput, NumberInput } from '..'
import { EQ } from './SingleFilter'
import { ComboFilter, AND } from './ComboFilter'


describe('ComboFilter', () => {

    class TestModel extends Model {}
    class TestComboFilter extends ComboFilter {
        isMatch(obj: any) : boolean {
            return true 
        }
    }

    it('isReady', () => {
        expect(new TestComboFilter([]).isReady).toBe(true)
        // const filter = new TestComboFilter([
        //     EQ('test', new StringValue('test', new Query(TestModel.__adapter)))
        // ])
        // expect(filter.isReady).toBe(false) 
    })
    it('URLSearchParams', () => {
        // TODO: implement
    })

    describe('AND', () => {
        it('isMatch', () => {
            const a = NumberInput({value: 1})
            const b = NumberInput({value: 2})
            const obj_true = { a: 1, b: 2 }
            const obj_false = { a: 1, b: 1 }
            expect(AND(EQ('a', a), EQ('b', b)).isMatch(obj_true)).toBe(true)
            expect(AND(EQ('a', a), EQ('b', b)).isMatch(obj_false)).toBe(false)
        })
    })
})
