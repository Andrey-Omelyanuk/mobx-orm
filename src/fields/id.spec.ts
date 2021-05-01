import { Model, model, id } from '../index'

// init: 
//  - create object without init fields
//  - init fields into constructor
//  - init fields after creation without init fields
// update:
//  - id cannot be changed
// delete:
//  - id can be reset to null and after that entry should be deleted from the store

// nothing happend when id setted to null for new object

describe('Field: id', () => {

    it('...', async ()=> {
    })

    // @model class SN  extends Model { @id id : number }                      // Single Number
    // @model class SS  extends Model { @id id : string }                      // Single String
    // @model class CNN extends Model { @id id1: number; @id id2: number }     // Composite Numbers
    // @model class CSS extends Model { @id id1: string; @id id2: string }     // Composite Strings
    // @model class CNS extends Model { @id id1: number; @id id2: string }     // Composite Number+String

    // beforeEach(() => {
    //     store.clearCacheForModel('SN')
    //     store.clearCacheForModel('SS')
    //     store.clearCacheForModel('CNN')
    //     store.clearCacheForModel('CSS')
    //     store.clearCacheForModel('CNS')
    // })

    // it('init: create object without id', async ()=> {
    //     let sn  = new SN();     expect(sn.id).toBeNull()
    //                             expect(sn.__id).toBeNull()
    //                             expect(SN.all().length).toBe(0)

    //     let ss  = new SS();     expect(ss.id).toBeNull()
    //                             expect(ss.__id).toBeNull()
    //                             expect(SS.all().length).toBe(0)

    //     let cns = new CNS();    expect(cns.id1).toBeNull()
    //                             expect(cns.id2).toBeNull()
    //                             expect(cns.__id).toBeNull()
    //                             expect(CNS.all().length).toBe(0)

    //     let cnn = new CNN();    expect(cnn.id1).toBeNull()
    //                             expect(cnn.id2).toBeNull()
    //                             expect(cnn.__id).toBeNull()
    //                             expect(CNN.all().length).toBe(0)

    //     let css = new CSS();    expect(css.id1).toBeNull()
    //                             expect(css.id2).toBeNull()
    //                             expect(css.__id).toBeNull()
    //                             expect(CSS.all().length).toBe(0)
    // })

    // it('init: set id in constructor', async ()=> {
    //     let sn  = new SN({id: 1});  expect(sn.id).toBe(1)
    //                                 expect(SN.all().length).toBe(1)
    //                                 expect(SN.get(sn.__id)).toBe(sn)

    //     let ss  = new SS({id: '1'});    expect(ss.id).toBe('1')
    //                                     expect(SS.all().length).toBe(1)
    //                                     expect(SS.get(ss.__id)).toBe(ss)

    //     let cns = new CNS({id1: 1, id2: '1'});  expect(cns.id1).toBe(1)
    //                                             expect(cns.id2).toBe('1')
    //                                             expect(CNS.all().length).toBe(1)
    //                                             expect(CNS.get(cns.__id)).toBe(cns)

    //     let cnn = new CNN({id1: 1, id2: 1});    expect(cnn.id1).toBe(1)
    //                                             expect(cnn.id2).toBe(1)
    //                                             expect(CNN.all().length).toBe(1)
    //                                             expect(CNN.get(cnn.__id)).toBe(cnn)

    //     let css = new CSS({id1: '1', id2: '1'});expect(css.id1).toBe('1')
    //                                             expect(css.id2).toBe('1')
    //                                             expect(CSS.all().length).toBe(1)
    //                                             expect(CSS.get(css.__id)).toBe(css)
    // })

    // it('init: set id after creation without id', async ()=> {
    //     let sn = new SN(); sn.id = 1;   expect(sn.id).toBe(1)
    //                                     expect(SN.all().length).toBe(1)
    //                                     expect(SN.get(sn.__id)).toBe(sn)

    //     let ss = new SS(); ss.id = '1'; expect(ss.id).toBe('1')
    //                                     expect(SS.all().length).toBe(1)
    //                                     expect(SS.get(ss.__id)).toBe(ss)
    //     let cns = new CNS()
    //     cns.id1 = 1;                    expect(cns.id1).toBe(1)
    //                                     expect(CNS.all().length).toBe(0)    // inject to store only when all ids was setted
    //     cns.id2 = '1';                  expect(cns.id2).toBe('1')
    //                                     expect(CNS.all().length).toBe(1)
    //                                     expect(CNS.get(cns.__id)).toBe(cns)
    //     let cnn = new CNN()
    //     cnn.id1 = 1;                    expect(cnn.id1).toBe(1)
    //                                     expect(CNN.all().length).toBe(0)    // inject to store only when all ids was setted
    //     cnn.id2 = 1;                    expect(cnn.id2).toBe(1)
    //                                     expect(CNN.all().length).toBe(1)
    //                                     expect(CNN.get(cnn.__id)).toBe(cnn)
    //     let css = new CSS()
    //     css.id1 = '1';                  expect(css.id1).toBe('1')
    //                                     expect(CSS.all().length).toBe(0)    // inject to store only when all ids was setted
    //     css.id2 = '1';                  expect(css.id2).toBe('1')
    //                                     expect(CSS.all().length).toBe(1)
    //                                     expect(CSS.get(css.__id)).toBe(css)
    // })

    // it('update: id cannot be changed', async ()=> {
    //     let sn = new SN({id: 1})    
    //     expect(() => { sn.id = 2 })         .toThrow(new Error('You cannot change id field: id'))

    //     let ss = new SS({id: '1'})    
    //     expect(() => { ss.id = '2' })       .toThrow(new Error('You cannot change id field: id'))

    //     let cns = new CNS({id1: 1, id2: '1'})
    //     expect(() => { cns.id1 =  2  })     .toThrow(new Error('You cannot change id field: id1'))
    //     expect(() => { cns.id2 = '2' })     .toThrow(new Error('You cannot change id field: id2'))

    //     let cnn = new CNN({id1: 1 , id2: 1})
    //     expect(() => { cnn.id1 =  2  })     .toThrow(new Error('You cannot change id field: id1'))
    //     expect(() => { cnn.id2 =  2  })     .toThrow(new Error('You cannot change id field: id2'))

    //     let css = new CSS({id1: '1', id2: '1'})
    //     expect(() => { css.id1 = '2' })     .toThrow(new Error('You cannot change id field: id1'))
    //     expect(() => { css.id2 = '2' })     .toThrow(new Error('You cannot change id field: id2'))
    // })

    // it('delete: id can be reset to null and after that entry should be deleted from the store', async ()=> {
    //     let sn    = new SN({id: 1});        expect(SN.get(sn.__id)).toBe(sn)
    //     let sn_id = sn.__id;                expect(SN.all().length).toBe(1)
    //         sn.id = null;                   expect(sn.id).toBeNull()
    //                                         expect(SN.all().length).toBe(0)
    //                                         expect(SN.get(sn_id)).toBeUndefined()

    //     let ss    = new SS({id: '1'});      expect(SS.get(ss.__id)).toBe(ss)
    //     let ss_id = ss.__id;                expect(SS.all().length).toBe(1) 
    //         ss.id = null;                   expect(ss.id).toBeNull()
    //                                         expect(SS.all().length).toBe(0)
    //                                         expect(SS.get(ss_id)).toBeUndefined()
    // })
})
