import { SelectorX as Selector, ASC, DESC } from './selector'
import { XAND as AND, XEQ as EQ } from './filters-x'
import { NumberValue, StringValue } from './value'


describe('Selector', () => {
    it('URLSearchParams empty', async () => {
        let selector = new Selector()
        expect(selector.URLSearchParams.toString()).toBe('')
    })
    it('URLSearchParams', async () => {
        let selector = new Selector(
            // filter
            AND(
                EQ('test_number', new NumberValue(0)),
                EQ('test_string', new StringValue('zero')),
            ),
            // order by
            new Map([['asc', ASC], ['desc', DESC]]),
            // offset & limit
            100, 500,
            // relations, fields, omit
            ['rel_a'    , 'rel_b'   ],
            ['field_a'  , 'field_b' ],
            ['omit_a'   , 'omit_b'  ],
        )
        expect(selector.URLSearchParams.toString()).toBe(
            'test_number=0&'+
            'test_string=zero&'+
            '__order_by=asc%2C-desc&'+
            '__limit=500&__offset=100&'+
            '__relations=rel_a%2Crel_b&'+
            '__fields=field_a%2Cfield_b&'+
            '__omit=omit_a%2Comit_b'
        )
    })
})
