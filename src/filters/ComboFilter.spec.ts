import { Model, Query, Input, NUMBER, model, id } from '..'
import { EQ } from './SingleFilter'
import { ComboFilter, AND } from './ComboFilter'


describe('ComboFilter', () => {

    @model class TestModel extends Model { @id(NUMBER()) id: number }
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
            const a = new Input(NUMBER(), {value: 1})
            const b = new Input(NUMBER(), {value: 2})
            const obj_true = { a: 1, b: 2 }
            const obj_false = { a: 1, b: 1 }
            expect(AND(EQ('a', a), EQ('b', b)).isMatch(obj_true)).toBe(true)
            expect(AND(EQ('a', a), EQ('b', b)).isMatch(obj_false)).toBe(false)
        })
    })
})
