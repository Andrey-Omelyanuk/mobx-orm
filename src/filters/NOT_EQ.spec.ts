import { NOT_EQ } from '../'


describe('NOT_EQ Filter', () => {
    describe('URLField', () => {
        it('A'      , ()=>{ expect(NOT_EQ('A'    ).URIField).toBe('A__not_eq')})
        it('B'      , ()=>{ expect(NOT_EQ('B'    ).URIField).toBe('B__not_eq')})
        it('A_B'    , ()=>{ expect(NOT_EQ('A_B'  ).URIField).toBe('A_B__not_eq')})
        it('A__B'   , ()=>{ expect(NOT_EQ('A__B' ).URIField).toBe('A__B__not_eq')})
    })

    describe('operator', () => {
        it('null !== null'      , ()=>{ expect(NOT_EQ('A', null).operator(null, null)).toBe(false) })
        it('null !== undefined' , ()=>{ expect(NOT_EQ('A', null).operator(null, undefined)).toBe(true) })
        it('null !== "text"'    , ()=>{ expect(NOT_EQ('A', null).operator(null, 'text')).toBe(true) })
        it('"text" !== "text"'  , ()=>{ expect(NOT_EQ('A', 'text').operator('text', 'text')).toBe(false) })
        it('"text" !== "textX"' , ()=>{ expect(NOT_EQ('A', 'text').operator('text', 'textA')).toBe(true) })
    })

    describe('isMatch', () => {
        let tests = [
            ['A', null, {A: null}, false],
            ['A', null, {A: undefined}, true],
            ['A', null, {A: 1}, true],
            ['A', undefined, {}, true],
            ['A', undefined, {A: 1}, true],
            ['A', 1, {A: 1}, false],
            ['A', 2, {A: 1}, true],
            ['A', 1, {B: 1}, true],

            ['A__B', 1, {A: [{B: 1}, {B: 1}]}, false],
            ['A__B', 1, {A: [{B: 1}, {B: 4}]}, true],
            ['A__B', 4, {A: [{B: 1}, {B: 4}]}, true],
            ['A__B', 1, {A: [{B: 2}, {B: 4}]}, true],
            ['A__B', 1, {A: [{C: 1}, {C: 4}]}, true],
            ['A__B', 1, {A: []}, false],

            ['A__B__C', 1, {}, false],
            ['A__B__C', 1, {A: {}}, false],
            ['A__B__C', 1, {A: {B: {}}}, true],
            ['A__B__C', 1, {A: {B: {C: 1}}}, false],
            ['A__B__C', 1, {A: {B: {C: 2}}}, true],
            ['A__B__C', null, {A: {B: {C: 1   }}}, true],
            ['A__B__C', null, {A: {B: {C: null}}}, false],
            ['A__B__C', true, {A: {B: {C: true}}}, false],
            ['A__B__C', true, {A: {B: {C: false}}}, true],
            ['A__B__C', true, {A: {B: {C: 1}}}, true],

            ['A__B__C', 1, {A: [ {B: {C: 0}}, {C: 1} ]}, true],
            ['A__B__C', 1, {A: [ {B: {C: 1}}, {C: 1} ]}, false],

            ['A__B__C',     1, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C',     2, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C',     3, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C',   '3', {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C',  true, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C', false, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],

            // Note: filter with undefined value should return true always, it's like filter is disabled
            ['A__B__C', undefined, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C', undefined, {A: [{B: [{C: 1}, {C: true},   ]}, {B: [{C: 2}, {C: null} ]}]}, true],
        ]

        for (const test of tests) {
            let [field, value, obj, isMatch] = test
            it(`${field}, ${JSON.stringify(value)} ${isMatch? '===' : '!=='} ${JSON.stringify(obj)}`, () => {
                expect(NOT_EQ(field as any, value).isMatch(obj)).toBe(isMatch)
            })
        }
    })
})
