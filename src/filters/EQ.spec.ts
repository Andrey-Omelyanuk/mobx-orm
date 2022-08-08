import { reaction, runInAction } from 'mobx'
import { Filter } from "./Filter"
import { SingleFilter, ValueType } from "./SingleFilter"
import { EQ, EQ_Filter } from './EQ'


describe('EQ Filter', () => {

    describe('Create', () => {
        describe('Type: Default', () => {
            it('A = undefined'  , ()=>{ expect(EQ('A'       )).toMatchObject({field: 'A', value: undefined, value_type: ValueType.STRING })})
            it('A = null'       , ()=>{ expect(EQ('A',  null)).toMatchObject({field: 'A', value:      null, value_type: ValueType.STRING})})
            it('A = "10"'       , ()=>{ expect(EQ('A',  '10')).toMatchObject({field: 'A', value:      '10', value_type: ValueType.STRING })})
            it('A = 10'         , ()=>{ expect(EQ('A',   10 )).toMatchObject({field: 'A', value:       10 , value_type: ValueType.NUMBER})})
            it('A = true'       , ()=>{ expect(EQ('A', true )).toMatchObject({field: 'A', value:      true, value_type: ValueType.BOOL})})
            it('A = false'      , ()=>{ expect(EQ('A', false)).toMatchObject({field: 'A', value:     false, value_type: ValueType.BOOL})})
        })

        // describe('Type: String (Default)', () => {
        //     it('field=A'            , ()=>{ expect(EQ('A'        )).toMatchObject({field: 'A', value: undefined })})
        //     it('field=A value="10"' , ()=>{ expect(EQ('A', '10'  )).toMatchObject({field: 'A', value: '10'})})
        //     it('field=A value="10"' , ()=>{ expect(EQ('A', '10', ValueType.STRING)).toMatchObject({field: 'A', value: '10'})})
        //     it('field=A value="10"' , ()=>{ expect(EQ('A',  10 , ValueType.STRING)).toMatchObject({field: 'A', value: '10'})})
        // })

        // constructor(field: string, value?: any, value_type: ValueType = ValueType.STRING) {
        // it('field=A value="10"     number'  , ()=>{ expect(new EQ_Filter('A',  10 , ValueType.NUMBER)).toMatchObject({field: 'A', value:  10 })})
        // it('field=A value=true     bool  '  , ()=>{ expect(new EQ_Filter('A', true, ValueType.BOOL  )).toMatchObject({field: 'A', value:  true })})
        // it('function', () => {
        //     expect(EQ('A'   )).toMatchObject({field: 'A'    , value: undefined })
        //     expect(EQ('A', 1)).toMatchObject({field: 'A'    , value: 1         })
        // })
        // it('EQ', () => {
        //     expect(EQ('A'   )).toMatchObject({field: 'A'    , value: undefined })
        //     expect(EQ('A', 1)).toMatchObject({field: 'A'    , value: 1         })
        // })
        // it('IN', () => {
        //     expect(IN('A'    )).toMatchObject({field: 'A'    , value: []})
        //     expect(IN('A', [])).toMatchObject({field: 'A'    , value: []})
        //     expect(IN('A', [1,2,3])).toMatchObject({field:'A', value: [1,2,3]})
        // })
        // it('AND', () => {
        //     expect(AND()).toMatchObject({field: null, value: []})
        //     expect(AND(EQ('A', 1), EQ('B', 2)))
        //         .toMatchObject({field: null, value: [{field: 'A', value: 1}, {field: 'B', value: 2}]})
        // })
        // it('OR', () => {
        //     expect(OR()).toMatchObject({field: null, value: []})
        //     expect(OR(EQ('A', 1), EQ('B', 2)))
        //         .toMatchObject({field: null, value: [{field: 'A', value: 1}, {field: 'B', value: 2}]})
        // })
    })

})