import { runInAction } from 'mobx'
import { Model, model } from '../model'
import id from './id'
import field from './field'
import foreign from './foreign'
import one from './one'


describe('One', () => {

    it('declare the one with single id', async () => {
        @model class A extends Model {
            @id     id: number
                     b: B
        }
        @model class B extends Model {
            @id          id  : number
            @field       a_id: number
            @foreign(A)  a   : A
        }

        one(B, 'a')(A, 'b') 
        expect((<any>A).fields['b'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).fields['b'].settings.remote_model).toBe(B)
        expect((<any>A).fields['b'].settings.remote_foreign_field).toBe('a')
    })

    it('declare the one with multi ids', async () => {
        @model class A extends Model {
            @id id1: number
            @id id2: number
                  b: B
        }
        @model class B extends Model {
            @id            id : number
            @field       a_id1: number
            @field       a_id2: number
            @foreign(A)  a    : A
        }

        one(B, 'a')(A, 'b') 
        expect((<any>A).fields['b'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).fields['b'].settings.remote_model).toBe(B)
        expect((<any>A).fields['b'].settings.remote_foreign_field).toBe('a')
    })

    it('declare the one with auto detect single id', async () => {
        @model class A extends Model {
            @id     id: number
                     b: B
        }
        @model class B extends Model {
            @id          id  : number
            @field       a_id: number
            @foreign(A)  a   : A
        }

        one(B)(A, 'b') 
        expect((<any>A).fields['b'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).fields['b'].settings.remote_model).toBe(B)
        expect((<any>A).fields['b'].settings.remote_foreign_field).toBe('a')
    })

    it('cross declare', async () => {
        @model class A extends Model {
            @id      id: number
            @field b_id: number
                      b: B
                      b_one: B
        }
        @model class B extends Model {
            @id           id: number
            @field      a_id: number
            @foreign(A) a: A
                        a_one: A
        }
        foreign(B)(A.prototype, 'b') 
        one(B)(A, 'b_one') 
        one(A)(B, 'a_one')

        expect((<any>A).fields['b_one'].decorator instanceof Function).toBeTruthy()
        expect((<any>A).fields['b_one'].settings.remote_model).toBe(B)
        expect((<any>A).fields['b_one'].settings.remote_foreign_field).toEqual('a')

        expect((<any>B).fields['a_one'].decorator instanceof Function).toBeTruthy()
        expect((<any>B).fields['a_one'].settings.remote_model).toBe(A)
        expect((<any>B).fields['a_one'].settings.remote_foreign_field).toEqual('b')
    })

    it('should be null by default', async () => {
        @model class A extends Model {
            @id      id: number
                      b: B
        }
        @model class B extends Model {
            @id           id: number
            @field      a_id: number
            @foreign(A) a   : A
        }
        one(B)(A, 'b') 

        let a = new A()
        expect(a.b).toBeNull()
    })

    it('should contain a remote object if the object is exist in cache', async () => {
        @model class A extends Model {
            @id      id: number
                      b: B
        }
        @model class B extends Model {
            @id           id: number
            @field      a_id: number
            @foreign(A) a   : A
        }
        one(B)(A, 'b') 

        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})
        expect(a.b).toBe(b)
    })

    it('should contain null if the object is not in the cache', async () => {
        @model class A extends Model {
            @id      id: number
                      b: B
        }
        @model class B extends Model {
            @id           id: number
            @field      a_id: number
            @foreign(A) a   : A
        }
        one(B)(A, 'b') 

        let a = new A()
        let b = new B({id: 2, a_id: 1})
        expect(b.a).toBeNull()
    })

    it('remote object create later', async () => {
        @model class A extends Model {
            @id      id: number
                      b: B
        }
        @model class B extends Model {
            @id           id: number
            @field      a_id: number
            @foreign(A) a   : A
        }
        one(B)(A, 'b') 

        let a = new A({id: 1})
        expect(a.b).toBeNull()

        let b = new B({id: 2, a_id: 1})
        expect(a.b).toBe(b)
    })

    // TODO very instresting test, I think I have to refactor the one field
    it('remote object delete later', async () => {
        @model class A extends Model {
            @id      id: number
                      b: B
        }
        @model class B extends Model {
            @id           id: number
            @field      a_id: number
            @foreign(A) a   : A
        }
        one(B)(A, 'b') 
        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})

        expect(a.b).toBe(b)
        runInAction(() => {
            b.id = null // delete object from cache
        })
        expect(a.b).toBeNull()
    })

    // TODO we need more tests


    // @model
    // class A extends Model {
    //     @id     id   : number
    //     @field  b_id : number
    //     @foreign('B', 'b_id'     ) b_foreign: B
    //     @one    ('B', 'a_foreign') b_one    : B
    // }

    // @model
    // class B extends Model {
    //     @id     id   : number
    //     @field  a_id : number
    //     @foreign('A', 'a_id'     ) a_foreign: A
    //     @one    ('A', 'b_foreign') a_one    : A
    // }

    // it('linked after creation (set foreign)', async ()=> {
    //     let a = new A(); await a.save()
    //     let b = new B(); await b.save()
    //     a.b_foreign = b                      
    //     expect(b.a_one).toBe(a)
    // })

    // it('cross link', async () => {
    //     let a = new A(); await a.save()
    //     let b = new B(); await b.save()                   
    //     a.b_foreign = b
    //     b.a_foreign = a
    //     expect(a.b_one).toBe(b)
    //     expect(b.a_one).toBe(a)
    // })

    // it('reset link (foreign field on remote set to null)', async ()=> {
    //     let a = new A(); await a.save()
    //     let b = new B(); await b.save()
    //     a.b_foreign = b                      
    //     a.b_foreign = null
    //     expect(b.a_one).toBeNull()
    // })

    // it('reset link (delete remote obj)', async ()=> {
    //     let a = new A(); await a.save()
    //     let b = new B(); await b.save()
    //     a.b_foreign = b    
    //     await a.delete()
    //     expect(b.a_one).toBeNull()
    // })

    // // TODO
    // // it('remote model created before', async ()=> {

    // //     @model
    // //     class B1 extends Model {
    // //         @id                    id   : number
    // //         @field                 a_id : number
    // //         @foreign('A1', 'a_id') a
    // //     }
    // //     let b = new B1({id: 1, a_id: 1})

    // //     function declare() {
    // //         @model
    // //         class A1 extends Model {
    // //             @id             id   : number
    // //             @one('B1', 'a') b_one  
    // //         }
    // //         let a = new A1({id: 1})
    // //         expect(a.b_one).toBe(b)
    // //     }
    // //     declare()
    // // })

    // it('remote model created after', async ()=> {
    //     @model
    //     class A2 extends Model {
    //         @id             id   : number
    //         @one('B2', 'a') b_one  
    //     }
    //     let a = new A2({id: 1})

    //     function declare() {
    //         @model
    //         class B2 extends Model {
    //             @id                    id   : number
    //             @field                 a_id : number
    //             @foreign('A2', 'a_id') a
    //         }
    //         let b = new B2({id: 1, a_id: 1})
    //         expect(a.b_one).toBe(b)
    //     }
    //     declare()
    // })
})
