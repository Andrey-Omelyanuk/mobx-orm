import { autorun, runInAction } from 'mobx'
import { EQ, IN, AND, OR } from './filters'


describe('Filters', () => {
    describe('to_str', () => {
        it('EQ', async () => {
            expect(EQ('A', 1).to_str()).toBe('A__eq=1')
            expect(EQ('B', 2).to_str()).toBe('B__eq=2')
        })
        it('IN', async () => {
            expect(IN('A', [1,2,3]).to_str()).toBe('A__in=1,2,3')
            expect(IN('B', [3]    ).to_str()).toBe('B__in=3')
        })
        it('AND', async () => {
            expect(AND(EQ('A', 1), EQ('B', 2)      ).to_str()).toBe('A__eq=1&B__eq=2')
            expect(AND(EQ('A', 1), IN('C', [1,2,3])).to_str()).toBe('A__eq=1&C__in=1,2,3')
        })
        it('OR', async () => {
            expect(OR(EQ('A', 1), EQ('B', 2)      ).to_str()).toBe('A__eq=1|B__eq=2')
            expect(OR(EQ('A', 1), IN('C', [1,2,3])).to_str()).toBe('A__eq=1|C__in=1,2,3')
        })
    })
    describe('is_match', () => {
        it('EQ', async () => {
            expect(EQ('A', 1).is_match({A: 1})).toBe(true)
            expect(EQ('A', 1).is_match({A: 2})).toBe(false)
            expect(EQ('A', 1).is_match({B: 2})).toBe(false)
            expect(EQ('B', 1).is_match({A: 1})).toBe(false)
        })
        it('IN', async () => {
            expect(IN('A', [1,2,3]).is_match({A: 1})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({A: 2})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({A: 3})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({A: 4})).toBe(false)
            expect(IN('A', [1,2,3]).is_match({A: 1})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({B: 1})).toBe(false)
            expect(IN('A', [2,3,4]).is_match({A: 1})).toBe(false)
        })
        it('AND', async () => {
            expect(AND(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(AND(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 2})).toBe(false)
            expect(AND(EQ('A', 1), EQ('B', 1)).is_match({A: 2, B: 1})).toBe(false)
            expect(AND(EQ('A', 2), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('B', 2)).is_match({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('C', 1)).is_match({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('C', 1)).is_match({A: 2, B: 2})).toBe(false)
        })
        it('OR', async () => {
            expect(OR(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 2})).toBe(true)
            expect(OR(EQ('A', 1), EQ('B', 1)).is_match({A: 2, B: 1})).toBe(true)
            expect(OR(EQ('A', 2), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('B', 2)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('C', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('C', 1)).is_match({A: 2, B: 2})).toBe(false)
        })
    })

    it('value is observible', async () => {
        let count = 0
        let filter = EQ('A', 1)
        autorun(() => { count = count + filter.value })
        runInAction(() => { filter.value = 2 })
        expect(count).toBe(3)
    })
})
