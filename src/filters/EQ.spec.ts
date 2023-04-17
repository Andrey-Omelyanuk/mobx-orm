import { EQ, EQV } from '../'


describe('EQ Filter', () => {
    describe('URLField', () => {
        it('A'      , ()=>{ expect(EQ('A'    ).URIField).toBe('A')})
        it('B'      , ()=>{ expect(EQ('B'    ).URIField).toBe('B')})
        it('A_B'    , ()=>{ expect(EQ('A_B'  ).URIField).toBe('A_B')})
        it('A__B'   , ()=>{ expect(EQ('A__B' ).URIField).toBe('A__B')})

        it('A'      , ()=>{ expect(EQV('A'    ).URIField).toBe('A__eq')})
        it('B'      , ()=>{ expect(EQV('B'    ).URIField).toBe('B__eq')})
        it('A_B'    , ()=>{ expect(EQV('A_B'  ).URIField).toBe('A_B__eq')})
        it('A__B'   , ()=>{ expect(EQV('A__B' ).URIField).toBe('A__B__eq')})
    })

    describe('operator', () => {
        it('null === null'      , ()=>{ expect(EQ('A').operator(null, null)).toBe(true ) })
        it('null === undefined' , ()=>{ expect(EQ('A').operator(null, undefined)).toBe(false) })
        it('null === "text"'    , ()=>{ expect(EQ('A').operator(null, 'text')).toBe(false) })
        it('"text" === "text"'  , ()=>{ expect(EQ('A').operator('text', 'text')).toBe(true) })
        it('"text" === "textX"' , ()=>{ expect(EQ('A').operator('text', 'textA')).toBe(false) })
        it('Date(now) === Date(now)' , ()=>{ const now = new Date(); expect(EQ('A').operator(now, now)).toBe(true) })
    })

    describe('isMatch', () => {
        let tests = [
            ['A', null, {A: null}, true],
            ['A', null, {A: undefined}, false],
            ['A', null, {A: 1}, false],
            ['A', undefined, {}, true],
            ['A', undefined, {A: 1}, true],
            ['A', 1, {A: 1}, true],
            ['A', 2, {A: 1}, false],
            ['A', 1, {B: 1}, false],

            ['A__B', 1, {A: [{B: 1}, {B: 4}]}, true],
            ['A__B', 4, {A: [{B: 1}, {B: 4}]}, true],
            ['A__B', 1, {A: [{B: 2}, {B: 4}]}, false],
            ['A__B', 1, {A: [{C: 1}, {C: 4}]}, false],
            ['A__B', 1, {A: []}, false],

            ['A__B__C', 1, {}, false],
            ['A__B__C', 1, {A: {}}, false],
            ['A__B__C', 1, {A: {B: {}}}, false],
            ['A__B__C', 1, {A: {B: {C: 1}}}, true],
            ['A__B__C', 1, {A: {B: {C: 2}}}, false],
            ['A__B__C', null, {A: {B: {C: 1   }}}, false],
            ['A__B__C', null, {A: {B: {C: null}}}, true],
            ['A__B__C', true, {A: {B: {C: true}}}, true],
            ['A__B__C', true, {A: {B: {C: false}}}, false],
            ['A__B__C', true, {A: {B: {C: 1}}}, false],

            ['A__B__C', 1, {A: [ {B: {C: 0}}, {C: 1} ]}, false],
            ['A__B__C', 1, {A: [ {B: {C: 1}}, {C: 1} ]}, true],

            ['A__B__C',     1, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C',     2, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C',     3, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, false],
            ['A__B__C',   '3', {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, false],
            ['A__B__C',  true, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C', false, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, false],

            // Note: filter with undefined value should return true always, it's like filter is disabled
            ['A__B__C', undefined, {A: [{B: [{C: 1}, {C: true}, {}]}, {B: [{C: 2}, {C: null} ]}]}, true],
            ['A__B__C', undefined, {A: [{B: [{C: 1}, {C: true},   ]}, {B: [{C: 2}, {C: null} ]}]}, true],
        ]

        for (const test of tests) {
            let [field, value, obj, isMatch] = test
            it(`${field}, ${JSON.stringify(value)} ${isMatch? '===' : '!=='} ${JSON.stringify(obj)}`, () => {
                expect(EQ(field as any, value).isMatch(obj)).toBe(isMatch)
            })
        }
    })
})
