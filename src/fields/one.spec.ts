import { runInAction } from 'mobx'
import { Model, model } from '../model'
import id from './id'
import field from './field'
import one from './one'


describe('Field: One', () => {

    describe('Declaration', () => {

        it('declare with single id', async () => {
            @model class A extends Model {
                @id     id      : number
                        b       : B
            }
            @model class B extends Model {
                @id     id      : number
                @field  a_id    : number
            }
            one(B, 'a_id')(A, 'b')
            expect(A.__relations['b'].decorator instanceof Function).toBeTruthy()
            expect(A.__relations['b'].settings.remote_model).toBe((B as any).__proto__)
            expect(A.__relations['b'].settings.remote_foreign_ids_names).toEqual(['a_id'])
        })

        it('declare with single id (auto detect)', async () => {
            @model class A extends Model {
                @id     id      : number
                        b       : B
            }
            @model class B extends Model {
                @id     id      : number
                @field  a_id    : number
            }
            one(B)(A, 'b')
            expect(A.__relations['b'].decorator instanceof Function).toBeTruthy()
            expect(A.__relations['b'].settings.remote_model).toBe((B as any).__proto__)
            expect(A.__relations['b'].settings.remote_foreign_ids_names).toEqual(['a_id'])
        })

        it('declare with multi ids', async () => {
            @model class A extends Model {
                @id     id1     : number
                @id     id2     : number
                        b       : B
            }
            @model class B extends Model {
                @id     id      : number
                @field  a_id1   : number
                @field  a_id2   : number
            }
            one(B, 'a_id1', 'a_id2')(A, 'b')
            expect(A.__relations['b'].decorator instanceof Function).toBeTruthy()
            expect(A.__relations['b'].settings.remote_model).toBe((B as any).__proto__)
            expect(A.__relations['b'].settings.remote_foreign_ids_names).toEqual(['a_id1', 'a_id2'])
        })

        it('cross declare', async () => {
            @model class A extends Model {
                @id      id     : number
                @field  b_id    : number
                        b_one   : B
            }
            @model class B extends Model {
                @id     id      : number
                @field  a_id    : number
                        a_one   : A
            }
            one(B)(A, 'b_one')
            one(A)(B, 'a_one')
            expect(A.__relations['b_one'].decorator instanceof Function).toBeTruthy()
            expect(A.__relations['b_one'].settings.remote_model).toBe((B as any).__proto__)
            expect(A.__relations['b_one'].settings.remote_foreign_ids_names).toEqual(['a_id'])
            expect(B.__relations['a_one'].decorator instanceof Function).toBeTruthy()
            expect(B.__relations['a_one'].settings.remote_model).toBe((A as any).__proto__)
            expect(B.__relations['a_one'].settings.remote_foreign_ids_names).toEqual(['b_id'])
        })
    })

    describe('Usage', () => {
        @model class A extends Model {
            @id     id      : number
                    b       : B
        }
        @model class B extends Model {
            @id     id      : number
            @field  a_id    : number
        }
        one(B)(A, 'b')

        beforeEach(() => {
            A.clearCache() 
            B.clearCache() 
        })

        it('remote obj create before', async () => {
            let b = new B({id: 2, a_id: 1}); 
            let a = new A({id: 1         }); expect(a.b).toBe(b)
        })

        it('remote obj create after', async () => {
            let a = new A({id: 1         }); expect(a.b).toBeNull()
            let b = new B({id: 2, a_id: 1}); expect(a.b).toBe(b)
        })

        it('remote obj not in the cache', async () => {
            let a = new A({  id: 1})
            let b = new B({a_id: 1}); expect(a.b).toBeNull()
        })

        it('remote obj delete after', async () => {
            let a = new A({id: 1})
            let b = new B({id: 2, a_id: 1})
            runInAction(() => b.id = null); expect(a.b).toBeNull()
        })

        it('edit foreign_id', async () => {
            let a  = new A({id: 1}) 
            let b1 = new B({id: 1})
            let b2 = new B({id: 2}); expect(a.b).toBeNull()
            runInAction(() => b1.a_id = 1); expect(a.b).toBe(b1)
                                            expect(b1.a_id).toBe(a.id)
                                            expect(b2.a_id).toBeUndefined()
            runInAction(() => b2.a_id = 1); expect(a.b).toBe(b2)
                                            expect(b1.a_id).toBeNull()
                                            expect(b2.a_id).toBe(a.id)
            // TODO: this is a bug
            // runInAction(() => b2.a_id = 3); expect(a.b).toBeNull()
        })

        it('set one: null to obj', async () => {
            let a = new A({id: 1})
            let b = new B({id: 2})
            runInAction(() => { a.b = b }); expect(a.b).toBe(b)
                                            expect(b.a_id).toBe(a.id)
        })

        it('set one: obj_a to obj_b', async () => {
            let a = new A({id: 1})
            let b = new B({id: 1, a_id: 1})
            let c = new B({id: 2 })
            runInAction(() => a.b = c );    expect(a.b).toBe(c)
                                            expect(b.a_id).toBeNull()
                                            expect(c.a_id).toBe(a.id)
        })

        it('set one: obj to null', async () => {
            let a = new A({id: 1})
            let b = new B({id: 2, a_id: 1})
            runInAction(() => a.b = null ); expect(a.b).toBeNull()
                                            expect(b.a_id).toBeNull()
        })
    })
})
