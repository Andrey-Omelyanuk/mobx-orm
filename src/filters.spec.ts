import { reaction, runInAction } from 'mobx'
import { EQ, IN, AND, OR, Filter, FilterType } from './filters'


describe('Filters', () => {
    describe('declare', () => {
        it('EQ', () => {
            expect(EQ(      )).toMatchObject({field: null   , value: null   })
            expect(EQ('A'   )).toMatchObject({field: 'A'    , value: null   })
            expect(EQ('A', 1)).toMatchObject({field: 'A'    , value: 1      })
        })
        it('IN', () => {
            expect(IN(       )).toMatchObject({field: null   , value: null   })
            expect(IN('A'    )).toMatchObject({field: 'A'    , value: null   })
            expect(IN('A', [])).toMatchObject({field: 'A'    , value: []     })
            expect(IN('A', [1,2,3])).toMatchObject({field:'A', value: [1,2,3]})
        })
        it('AND', () => {
            expect(AND()).toMatchObject({field: null, value: []})
            expect(AND(EQ('A', 1), EQ('B', 2)))
                .toMatchObject({field: null, value: [{field: 'A', value: 1}, {field: 'B', value: 2}]})
        })
        it('OR', () => {
            expect(OR()).toMatchObject({field: null, value: []})
            expect(OR(EQ('A', 1), EQ('B', 2)))
                .toMatchObject({field: null, value: [{field: 'A', value: 1}, {field: 'B', value: 2}]})
        })
    })
    describe('edit', () => {
        it('EQ', () => {
            let f = EQ('A', 1) 
            runInAction(() => f.field = 'B'); expect(f).toMatchObject({field: 'B', value: 1})
            runInAction(() => f.value = 2  ); expect(f).toMatchObject({field: 'B', value: 2})
        })
        it('IN', () => {
            let f = IN('A', [1]) 
            runInAction(() => f.field = 'B'     ); expect(f).toMatchObject({field: 'B', value: [1]})
            runInAction(() => f.value.push(2)   ); expect(f).toMatchObject({field: 'B', value: [1, 2]})
            runInAction(() => f.value = [3]     ); expect(f).toMatchObject({field: 'B', value: [3]})
        })
        it('AND', () => {
            let f = AND(EQ('A', 1)) 
            runInAction(() => f.value = [EQ('B', 2)]); expect(f).toMatchObject({field: null, value: [{field: 'B', value: 2}]})
            runInAction(() => f.value.push(EQ('C', 0))); expect(f).toMatchObject({field: null, value: [{field: 'B', value: 2}, {field: 'C', value: 0}]})
        })
        it('OR', () => {
            let f = OR(EQ('A', 1)) 
            runInAction(() => f.value = [EQ('B', 2)]); expect(f).toMatchObject({field: null, value: [{field: 'B', value: 2}]})
            runInAction(() => f.value.push(EQ('C', 0))); expect(f).toMatchObject({field: null, value: [{field: 'B', value: 2}, {field: 'C', value: 0}]})
        })
    })
    describe('to_str', () => {
        it('EQ', () => {
            expect(EQ('A', 1).to_str()).toBe('A__eq=1')
            expect(EQ('B', 2).to_str()).toBe('B__eq=2')
            expect(EQ().to_str()).toBe('')
            expect(EQ('A').to_str()).toBe('')
        })
        it('IN', () => {
            expect(IN('A', [1,2,3]).to_str()).toBe('A__in=1,2,3')
            expect(IN('B', [3]    ).to_str()).toBe('B__in=3')
        })
        it('AND', () => {
            expect(AND(EQ('A', 1), EQ('B', 2)      ).to_str()).toBe('A__eq=1&B__eq=2')
            expect(AND(EQ('A', 1), IN('C', [1,2,3])).to_str()).toBe('A__eq=1&C__in=1,2,3')
        })
        it('OR', () => {
            expect(OR(EQ('A', 1), EQ('B', 2)      ).to_str()).toBe('A__eq=1|B__eq=2')
            expect(OR(EQ('A', 1), IN('C', [1,2,3])).to_str()).toBe('A__eq=1|C__in=1,2,3')
        })
    })
    describe('is_match', () => {
        it('EQ', () => {
            expect(EQ('A', 1).is_match({A: 1})).toBe(true)
            expect(EQ('A', 1).is_match({A: 2})).toBe(false)
            expect(EQ('A', 1).is_match({B: 2})).toBe(false)
            expect(EQ('B', 1).is_match({A: 1})).toBe(false)
        })
        it('IN', () => {
            expect(IN('A', [1,2,3]).is_match({A: 1})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({A: 2})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({A: 3})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({A: 4})).toBe(false)
            expect(IN('A', [1,2,3]).is_match({A: 1})).toBe(true)
            expect(IN('A', [1,2,3]).is_match({B: 1})).toBe(false)
            expect(IN('A', [2,3,4]).is_match({A: 1})).toBe(false)
        })
        it('AND', () => {
            expect(AND(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(AND(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 2})).toBe(false)
            expect(AND(EQ('A', 1), EQ('B', 1)).is_match({A: 2, B: 1})).toBe(false)
            expect(AND(EQ('A', 2), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('B', 2)).is_match({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('C', 1)).is_match({A: 1, B: 1})).toBe(false)
            expect(AND(EQ('A', 1), EQ('C', 1)).is_match({A: 2, B: 2})).toBe(false)
        })
        it('OR', () => {
            expect(OR(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('B', 1)).is_match({A: 1, B: 2})).toBe(true)
            expect(OR(EQ('A', 1), EQ('B', 1)).is_match({A: 2, B: 1})).toBe(true)
            expect(OR(EQ('A', 2), EQ('B', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('B', 2)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('C', 1)).is_match({A: 1, B: 1})).toBe(true)
            expect(OR(EQ('A', 1), EQ('C', 1)).is_match({A: 2, B: 2})).toBe(false)
        })
    })

    it('type, field and value are observible', () => {
        let count = 0
        let filter = new Filter(FilterType.EQ, 'A', 1)
        reaction(()=> [filter.type, filter.field, filter.value], () => { count = count + 1 })

        runInAction(() => { filter.type  = FilterType.AND   }); expect(count).toBe(1)
        runInAction(() => { filter.field = 'B'              }); expect(count).toBe(2)
        runInAction(() => { filter.value = 2                }); expect(count).toBe(3)
    })
})
