import { runInAction } from 'mobx'
import { Model, model } from '../model'
import id from './id'
import field from './field'
import many from './many'
import { local } from '../adapters/local'
import foreign from './foreign'


describe('Field: Many', () => {

    function declare() {
        @model class A extends Model {
            @id     id: number
                    bs: B[]
        }
        @model class B extends Model {
            @id          id  : number
            @field       a_id: number
        }
        return {A: A, B: B}
    }

    it('declare the many with single id', async () => {
        const {A, B} = declare()
        many(B, 'a_id')(A, 'bs')
        expect(A.__relations['bs'].decorator instanceof Function).toBeTruthy()
        expect(A.__relations['bs'].settings.remote_model).toBe(B)
        expect(A.__relations['bs'].settings.remote_foreign_ids_names).toEqual(['a_id'])
    })

    it('declare the many with multi ids', async () => {
        @model class A extends Model {
            @id id1: number
            @id id2: number
                 bs: B[]
        }
        @model class B extends Model {
            @id            id : number
            @field       a_id1: number
            @field       a_id2: number
        }

        many(B, 'a_id1', 'a_id2')(A, 'bs')
        expect(A.__relations['bs'].decorator instanceof Function).toBeTruthy()
        expect(A.__relations['bs'].settings.remote_model).toBe(B)
        expect(A.__relations['bs'].settings.remote_foreign_ids_names).toEqual(['a_id1', 'a_id2'])
    })

    it('declare the many with auto detect single id', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')
        expect(A.__relations['bs'].decorator instanceof Function).toBeTruthy()
        expect(A.__relations['bs'].settings.remote_model).toBe(B)
        expect(A.__relations['bs'].settings.remote_foreign_ids_names).toEqual(['a_id'])
    })

    it('cross declare', async () => {
        @model class A extends Model {
            @id      id: number
            @field b_id: number
                     bs: B[]
        }
        @model class B extends Model {
            @id           id: number
            @field      a_id: number
                          as: A[]
        }
        many(B)(A, 'bs')
        many(A)(B, 'as')

        expect(A.__relations['bs'].decorator instanceof Function).toBeTruthy()
        expect(A.__relations['bs'].settings.remote_model).toBe(B)
        expect(A.__relations['bs'].settings.remote_foreign_ids_names).toEqual(['a_id'])

        expect(B.__relations['as'].decorator instanceof Function).toBeTruthy()
        expect(B.__relations['as'].settings.remote_model).toBe(A)
        expect(B.__relations['as'].settings.remote_foreign_ids_names).toEqual(['b_id'])
    })

    it('should be [] by default', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A()
        expect(a.bs).toEqual([])
    })

    it('should contain a remote object if the object is exist in cache', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})
        expect(a.bs).toEqual([b])
    })

    it('should contain [] if the object is not in the cache', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A()
        let b = new B({id: 2, a_id: 1})
        expect(a.bs).toEqual([])
    })

    it('should contain [] if the remote object is not in the cache', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A({id: 1})
        let b = new B({a_id: 1})
        expect(a.bs).toEqual([])
    })

    it('remote object create later', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')
        let a = new A({id: 1})

        expect(a.bs).toEqual([])
        let b = new B({id: 2, a_id: 1})
        expect(a.bs).toEqual([b])
    })

    it('remote object delete later', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')
        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})

        expect(a.bs).toEqual([b])
        runInAction(() => {
            b.id = null // delete object from cache
        })
        expect(a.bs).toEqual([])
    })

    it('add obj to many ', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A({id: 1})
        let b = new B({id: 2})

        expect(a.bs).toEqual([])
        expect(b.a_id).toBeUndefined()
        runInAction(() => {
            a.bs.push(b)
        })
        expect(a.bs).toEqual([b])
        expect(b.a_id).toBe(a.id)
    })

    it('remove obj from many', async () => {
        const {A, B} = declare()
        many(B)(A, 'bs')

        let a = new A({id: 1})
        let b = new B({id: 2, a_id: 1})

        expect(a.bs).toEqual([b])
        expect(b.a_id).toBe(a.id)
        runInAction(() => {
            const i = a.bs.indexOf(b)
            a.bs.splice(i, 1)
        })
        expect(a.bs).toEqual([])
        expect(b.a_id).toBeNull()
    })

    it('e2e', async () => {

        @local()
        @model class Program extends Model { 
            @id    id 	: number 
            @field name	: string

            sets   : ProgramSet []
        }
        @local()
        @model class ProgramSet extends Model { 
            @id     id          : number 
            @field  order       : number
            @field  program_id  : number 
            @foreign(Program) program : Program 
        }
        many(ProgramSet)(Program, 'sets') 
        let p_1 = new Program({name: 'p_1'}); await p_1.save()
        let p_2 = new Program({name: 'p_2'}); await p_2.save()
        let p_3 = new Program({name: 'p_3'}); await p_3.save()

        let ps_1 = new ProgramSet({program_id: p_1.id, order: 1}); await ps_1.save()
        let ps_2 = new ProgramSet({program_id: p_1.id, order: 2}); await ps_2.save()
        let ps_3 = new ProgramSet({program_id: p_1.id, order: 3}); await ps_3.save()
        let ps_4 = new ProgramSet({program_id: p_2.id, order: 4}); await ps_4.save()

        expect(ps_1.program).toEqual(p_1)
        expect(p_1.sets).toEqual([ps_1, ps_2, ps_3])
        expect(p_2.sets).toEqual([ps_4])
    })

})
