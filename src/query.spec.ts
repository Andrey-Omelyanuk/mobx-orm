import { autorun, runInAction } from 'mobx'
import { Model, model } from './model'
import id from './fields/id'
import Query from './query'
import field from './fields/field'
import { local, init_local_data } from './adapters/local' 


describe('Query', () => {

    @local()
    @model class A extends Model {
        @id     id !: number
        @field   a !: number
        @field   b !: string
        @field   c !: boolean
    }

    let obj_a = {id: 0, a: 5, b: 'a', c: true } 
    let obj_b = {id: 1,       b: 'c', c: false} 
    let obj_c = {id: 2, a: 2,         c: false} 
    let obj_d = {id: 3, a: 2, b: 'f'          } 
    let obj_e = {id: 4, a: 1, b: 'a', c: true } 

    let data_set = [ obj_a, obj_b, obj_c, obj_d, obj_e ]

    let query: Query<A>
    let load : any

    beforeAll(() => {
        init_local_data(A, data_set)
        load  = jest.spyOn((<any>A).__proto__.adapter, 'load')
    })

    beforeEach(async () => {
        query = new Query<A>(A)
        await query.ready() 
    })

    afterEach(async () => {
        query.destroy()
        A.clearCache()
        jest.clearAllMocks();
    })

    describe('filters', () => {

        it('is observible', async () => {
            // TODO
        })

        it('default', async () => {
            expect(query.filters).toEqual({})
        })

        it('set', async () => {
            // the load will be triggered when query is created 
            expect(load).toHaveBeenCalledTimes(1) 
            expect(load).toHaveBeenCalledWith(query.filters, query.order_by)
            // change filters
            runInAction(() => { query.filters = {a: 1}})
            expect(query.filters).toMatchObject({a: 1})
            // the load will be triggered only once for an action
            // expect(load).toHaveBeenCalledTimes(2) 
            // expect(load).toHaveBeenCalledWith(query.filters, query.order_by)
            // await query.ready()

        })

        it('set from X', async () => {
            // TODO
        })

        it('side effect X', async () => {
            // TODO
        })
    })

    describe('order_by', () => {
        // TODO
        it('is observible', async () => {
            // TODO
        })
        // TODO
        it('set value', async () => {
            // default
            expect(query.order_by).toEqual([])
            expect(load).toHaveBeenCalledTimes(1)
            // expect(load).toHaveBeenCalledWith(query.filters, query.order_by)
            // expect(query.items.map((i) => i.id)).toEqual([0, 1, 2, 3, 4])
            // number field
            query.order_by = ['a']
            await query.ready() // wait update
            expect(query.order_by).toEqual(['a'])
            // expect(load).toHaveBeenCalledTimes(2)
            // expect(load).toHaveBeenCalledWith(query.filters, query.order_by)
            // expect(query.items.map((i) => i.id)).toEqual([4, 2, 3, 0, 1])
            // number field (revert)
            query.order_by = ['-a']
            // string field 
            query.order_by = ['b']
            // string field (revert)
            query.order_by = ['-b']
            // boolean field 
            query.order_by = ['c']
            // boolean field (revert)
            query.order_by = ['-c']
            // empty 
            query.order_by = []
            await query.ready() // wait update
            expect(query.order_by).toEqual([])
            // expect(load).toHaveBeenCalledTimes(2)
            expect(load).toHaveBeenCalledWith(query.filters, query.order_by)
            // expect(query.items.map((i) => i.id)).toEqual([0, 1, 2, 3, 4])
            // error: set not exist field
            query.order_by = ['x']
            // error: set number
            query.order_by = <any>2
            // error: set null 
            query.order_by = <any>null 
            // error: set undefined
            query.order_by = <any>undefined
        })
    })


    describe('constructor', () => {

        it('default', async () => {
            let q = new Query<A>(A);    
            expect(q).toMatchObject({
                filters: {}, order_by: [], items: [],
                is_ready: false, is_updating: true,
                error: '', model: A
            })
            expect(load).toHaveBeenCalledTimes(2)  // query is the second Query that run in this test case
            expect(load).toHaveBeenCalledWith(q.filters, q.order_by)
            q.destroy()
        })

        it('filters + order', async () => {
            let q = new Query<A>(A, {a: 1}, ['-a']);    
            expect(q).toMatchObject({
                filters: {a: 1}, order_by: ['-a'], items: [],
                is_ready: false, is_updating: true,
                error: '', model: A
            })
            expect(load).toHaveBeenCalledTimes(2)  // query is the second Query that run in this test case
            expect(load).toHaveBeenCalledWith(q.filters, q.order_by)
            q.destroy()
        })
    })

    describe('destroy()', () => {
        // TODO
    })

    describe('update()', () => {
        // TODO
    })

    describe('ready', () => {
        it('is promise', async () => {
            // TODO
            // let   q = new Query<A>(A);  expect(q.is_ready).toBe(false) 
            // await q.ready();            expect(q.is_ready).toBe(true)  
            // await q.ready();            expect(q.is_ready).toBe(true)  // double check

            // runInAction(() => { q.is_ready = false }); 
            // q.ready().then(() => {      expect(q.is_ready).toBe(true) });                  
            //                             expect(q.is_ready).toBe(false)
            // runInAction(() => { q.is_ready = true }); 
            
            // q.destroy()
        })
    })

    describe('watch_obj()', () => {
        // TODO
    })

    describe('should_be_in_the_list()', () => {
        // TODO
    })

    it('e2e', async () => {
        let q = new Query<A>(A);   
        // ?
        await q.ready();           
        // ?
        q.filters = {a: 1}
        // ?
        await q.ready();           
        // ?
        q.order_by = ['-a']
        // ?
        await q.ready();           
        // ?
        q.destroy()
        // ?
    })

    it('is_updating', async () => {
        await query.ready()
                                    expect(query.is_updating).toBe(false) 
        query.update().then(() => { expect(query.is_updating).toBe(false)}) 
                                    expect(query.is_updating).toBe(true) 
        await query.ready();        expect(query.is_updating).toBe(false) 
    })

    // --- legacy --------------------------------------------------------


    it('query.items should be observable', async () => {
        // TODO:
        // @mock_adapter()
        // @model class A extends Model {
        //     @id id: number
        // }

        // let q = new Query<A>(A); await q.ready() 
        // let count = 0

        // autorun(() => {
        //     q.items.length
        //     count = count + 1
        // })

        // expect(count).toBe(1)
        // runInAction(() => q.items.push(new A()))
        // expect(count).toBe(2)

        // q.destroy()
    })

    it('query.items should be updated if cache was changed', async () => {
        // TODO
        // @mock_adapter()
        // @model class A extends Model {
        //     @id id: number
        // }

        // let a, q = new Query<A>(A); await q.ready() 

        //                     expect(q.items.length).toBe(0)
        // a = new A({id: 1}); expect(q.items.length).toBe(1)
        // await a.delete();   expect(q.items.length).toBe(0)

        // q.destroy()
    })

    it('query.items should be updated if cache was changed (filters edition)', async () => {
        // TODO
        // @mock_adapter()
        // @model class A extends Model {
        //     @id    id: number
        //     @field  a: number
        // }
        // let q = new Query<A>(A, {a: 3}); await q.ready() 

        //                                 expect(q.items.length).toBe(0)
        // let a1 = new A({id: 1});        expect(q.items.length).toBe(0)
        // let a2 = new A({id: 2, a: 1});  expect(q.items.length).toBe(0)
        // let a3 = new A({id: 3, a: 3});  expect(q.items.length).toBe(1)
        // await a1.delete();              expect(q.items.length).toBe(1)
        // await a2.delete();              expect(q.items.length).toBe(1)
        // await a3.delete();              expect(q.items.length).toBe(0)

        // q.destroy()
    })

    it('query.items should contain exist objects and new objects', async () => {
        // TODO
        // let a1 = new A({id: 1})
        // let a2 = new A({id: 2})
        // let q = A.load(); await q.ready()
        //                             expect(q.items.length).toBe(2)
        // let a3 = new A({id: 3});    expect(q.items.length).toBe(3)
        // let a4 = new A({id: 4});    expect(q.items.length).toBe(4)
        // await a1.delete();          expect(q.items.length).toBe(3)
        // await a2.delete();          expect(q.items.length).toBe(2)
        // await a3.delete();          expect(q.items.length).toBe(1)
        // await a4.delete();          expect(q.items.length).toBe(0)

    })
})
