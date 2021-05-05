import { Model, model } from '../model'
import id from './id'
import foreign from './foreign'
import field from './field'


describe('Field: foreign', () => {

    it('declare foreign with single id', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id          id  : number
            @field       a_id: number
            @foreign(A)  a   : A 
        }
        expect((<any>B).fields['a'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).fields['a'].settings.foreign_model).toBe(A)
        expect((<any>B).fields['a'].settings.foreign_ids_names).toEqual(['a_id'])
    })

    it('declare foreign with multi ids', async () => {
        @model class A extends Model {
            @id id1: number
            @id id2: number
        }
        @model class B extends Model {
            @id    id: number
            @field a_id1: number
            @field a_id2: number
            @foreign(A, 'a_id1', 'a_id2') a: A 
        }
        expect((<any>B).fields['a'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).fields['a'].settings.foreign_model).toBe(A)
        expect((<any>B).fields['a'].settings.foreign_ids_names).toEqual(['a_id1', 'a_id2'])
    })

    it('declare foreign with auto detect single id', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        expect((<any>B).fields['a'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).fields['a'].settings.foreign_model).toBe(A)
        expect((<any>B).fields['a'].settings.foreign_ids_names).toEqual(['a_id'])
    })

    it('cross declare', async () => {
        @model class A extends Model {
            @id      id: number
            @field b_id: number
                   b   : B
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        // we have to use this band-aid for use cross foreigns
        foreign(B)(A.prototype, 'b') 

        expect((<any>A).fields['b'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).fields['b'].settings.foreign_model).toBe(B)
        expect((<any>A).fields['b'].settings.foreign_ids_names).toEqual(['b_id'])
        expect((<any>B).fields['a'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).fields['a'].settings.foreign_model).toBe(A)
        expect((<any>B).fields['a'].settings.foreign_ids_names).toEqual(['a_id'])
    })

    it('should be null by default', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        let b = new B()
        expect(b.a).toBeNull()
    })

    it('should contain a foreign object if the object is exist in cache', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})
        expect(b.a).toBe(a)
    })

    it('should contain null if the object is not in the cache', async () => {
        @model class A extends Model {
            @id id: number
        }
        @model class B extends Model {
            @id      id: number
            @field a_id: number
            @foreign(A) a: A 
        }
        let a = new A()
        let b = new B({id: 2, a_id: 1})
        expect(b.a).toBeNull()
    })

    // it('init: linked after creation (id)', async ()=> {
    //     let sn  = new SN ({id :  1 })
    //     let ss  = new SS ({id : '1'})
    //     sn.ss_id = ss.id;   expect(sn.ss).toBe(ss)
    //     ss.sn_id = sn.id;   expect(ss.sn).toBe(sn)

    //     let cnn = new CNN({id1:  1 , id2:  1 })
    //     let cns = new CNS({id1:  1 , id2: '1'})
    //     let css = new CSS({id1: '1', id2: '1'})
    //     cnn.cns_id1 = cns.id1; cnn.cns_id2 = cns.id2; expect(cnn.cns).toBe(cns)
    //     cns.css_id1 = css.id1; cns.css_id2 = css.id2; expect(cns.css).toBe(css)
    //     css.cnn_id1 = cnn.id1; css.cnn_id2 = cnn.id2; expect(css.cnn).toBe(cnn)
    // })

    // it('init: linked after creation (foreign)', async ()=> {
    //     let sn  = new SN ({id :  1 })
    //     let ss  = new SS ({id : '1'})
    //     sn.ss = ss;     expect(sn.ss   ).toBe(ss)
    //                     expect(sn.ss_id).toBe(ss.id)
    //     ss.sn = sn;     expect(ss.sn   ).toBe(sn)
    //                     expect(ss.sn_id).toBe(sn.id)

    //     let cnn = new CNN({id1:  1 , id2:  1 })
    //     let cns = new CNS({id1:  1 , id2: '1'})
    //     let css = new CSS({id1: '1', id2: '1'})
    //     cnn.cns = cns;  expect(cnn.cns    ).toBe(cns)
    //                     expect(cnn.cns_id1).toBe(cns.id1)
    //                     expect(cnn.cns_id2).toBe(cns.id2)
    //     cns.css = css;  expect(cns.css    ).toBe(css)
    //                     expect(cns.css_id1).toBe(css.id1)
    //                     expect(cns.css_id2).toBe(css.id2)
    //     css.cnn = cnn;  expect(css.cnn    ).toBe(cnn)
    //                     expect(css.cnn_id1).toBe(cnn.id1)
    //                     expect(css.cnn_id2).toBe(cnn.id2)
    // })

    // it('delete: reset link (id)', async ()=> {
    //     let sn  = new SN(); await sn.save()
    //     let ss  = new SS(); await ss.save()
    //     sn.ss = ss; sn.ss_id = null;    expect(sn.ss).toBeNull()
    //     ss.sn = sn; ss.sn_id = null;    expect(ss.sn).toBeNull()

    //     let cnn = new CNN(); await cnn.save()
    //     let cns = new CNS(); await cns.save()
    //     let css = new CSS(); await css.save()
    //     cnn.cns = cns;  cnn.cns_id1 = null; expect(cnn.cns).toBeNull()
    //     cnn.cns = cns;  cnn.cns_id2 = null; expect(cnn.cns).toBeNull()
    //     cns.css = css;  cns.css_id1 = null; expect(cns.css).toBeNull()
    //     cns.css = css;  cns.css_id2 = null; expect(cns.css).toBeNull()
    //     css.cnn = cnn;  css.cnn_id1 = null; expect(css.cnn).toBeNull()
    //     css.cnn = cnn;  css.cnn_id2 = null; expect(css.cnn).toBeNull()
    // })

    // it('delete: reset link (foreign)', async ()=> {
    //     let sn  = new SN(); await sn.save()
    //     let ss  = new SS(); await ss.save()
    //     sn.ss = ss; sn.ss_id = null;    expect(sn.ss).toBeNull()
    //     ss.sn = sn; ss.sn_id = null;    expect(ss.sn).toBeNull()

    //     let cnn = new CNN(); await cnn.save()
    //     let cns = new CNS(); await cns.save()
    //     let css = new CSS(); await css.save()
    //     cnn.cns = cns;  cnn.cns = null; expect(cnn.cns    ).toBeNull()
    //                                     expect(cnn.cns_id1).toBeNull()
    //                                     expect(cnn.cns_id2).toBeNull()
    //     cns.css = css;  cns.css = null; expect(cns.css    ).toBeNull()
    //                                     expect(cns.css_id1).toBeNull()
    //                                     expect(cns.css_id2).toBeNull()
    //     css.cnn = cnn;  css.cnn = null; expect(css.cnn    ).toBeNull()
    //                                     expect(css.cnn_id1).toBeNull()
    //                                     expect(css.cnn_id2).toBeNull()
    // })

    // // TODO
    // // it('remote model created before', async ()=> {
    // //     @model
    // //     class B1 extends Model {
    // //         @id     id   : number
    // //         @field  a_id : number
    // //         @foreign('A1', 'a_id') a
    // //     }

    // //     let b = new B1({id: 1, a_id: 1})

    // //     function declare() {
    // //         @model class A1 extends Model { @id id : number }
    // //         let a = new A1({id: 1})
    // //         expect(b.a).toBe(a)
    // //     }
    // //     declare()
    // // })

})
