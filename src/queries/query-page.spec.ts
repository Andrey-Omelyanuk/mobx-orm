import { runInAction } from 'mobx'
import { Model, model, field, QueryPage, LocalAdapter, local, EQ, ASC, DESC } from '../'
import { data_set, obj_a, obj_b, obj_c, obj_d, obj_e } from '../test.utils' 


describe('QueryPage', () => {

    @local()
    @model class A extends Model {
        @field   a !: number
        @field   b !: string
        @field   c !: boolean
    }

    const adapter   : LocalAdapter<A> = (<any>A).__adapter
    const cache     : Map<number, A>  = (<any>A).__cache
    let query: QueryPage<A>
    let query_load              : any
    let adapter_load            : any
    let adapter_getTotalCount   : any

    beforeAll(() => {
        adapter.init_local_data(data_set)
    })

    beforeEach(async () => {
        query = new QueryPage<A>(adapter, cache)
        query_load              = jest.spyOn(query, '__load')
        adapter_load            = jest.spyOn(adapter, 'load')
        adapter_getTotalCount   = jest.spyOn(adapter, 'getTotalCount')
    })

    afterEach(async () => {
        query.destroy()
        A.clearCache()
        jest.clearAllMocks();
    })

    describe('constructor', () => {
        it('...', async () => {
            expect(query).toMatchObject({
                __adapter: adapter,
                __base_cache: A.__cache,
                filters: undefined,
                // order_by: new Map(),
                offset: 0,
                limit: 50 
            })
            expect(adapter_load).toHaveBeenCalledTimes(0) 
            // expect(adapter_load).toHaveBeenCalledWith(undefined, query.order_by, query.page_size, query.page)
        })

        it('need_to_update', async () => {
                                                            expect(query.need_to_update).toBe(true)
            runInAction(() => query.order_by = new Map());  expect(query.need_to_update).toBe(true)
            runInAction(() => query.need_to_update = false)
            const filter = EQ('a', 2)
            runInAction(() => query.filters = filter);      expect(query.need_to_update).toBe(true)
            runInAction(() => query.need_to_update = false);expect(query.need_to_update).toBe(false)
            runInAction(() => filter.value = 3);            expect(query.need_to_update).toBe(true)
            runInAction(() => query.need_to_update = false)
            query.setPageSize(3);                           expect(query.need_to_update).toBe(true)
            runInAction(() => query.need_to_update = false)
            query.setPage(3);                               expect(query.need_to_update).toBe(true)
        })
    })

    it('shadowLoad', async ()=> {
                            expect(query.total).toBe(0)
                            expect(query_load).toHaveBeenCalledTimes(0)
                            expect(adapter_load).toHaveBeenCalledTimes(0)
                            expect(adapter_getTotalCount).toHaveBeenCalledTimes(0)
                            expect(query.is_ready).toBe(false)
        await query.shadowLoad() 
                            expect(query.total).toBe(5)
                            expect(query_load).toHaveBeenCalledTimes(1)
                            expect(adapter_load).toHaveBeenCalledTimes(1)
                            expect(adapter_getTotalCount).toHaveBeenCalledTimes(1)
                            expect(query.is_ready).toBe(true)
                            expect(query.need_to_update).toBe(false)
        query.need_to_update = true
                            expect(query.need_to_update).toBe(true)
        await query.shadowLoad() 
                            expect(query_load).toHaveBeenCalledTimes(2)
                            expect(adapter_load).toHaveBeenCalledTimes(2)
                            expect(adapter_getTotalCount).toHaveBeenCalledTimes(2)
                            expect(query.is_ready).toBe(true)
                            expect(query.need_to_update).toBe(false)
    })

    it('need_to_update', async () => {
        runInAction(() => query.need_to_update = false);    expect(query.need_to_update).toBe(false)
        runInAction(() => query.order_by = new Map());      expect(query.need_to_update).toBe(true)
        runInAction(() => query.need_to_update = false);    expect(query.need_to_update).toBe(false)
        runInAction(() => query.order_by.set('a', ASC));    expect(query.need_to_update).toBe(true)
        runInAction(() => query.need_to_update = false);    expect(query.need_to_update).toBe(false)
        runInAction(() => query.order_by.set('a', DESC));   expect(query.need_to_update).toBe(true)
        runInAction(() => query.need_to_update = false);    expect(query.need_to_update).toBe(false)
        runInAction(() => query.order_by.set('a', DESC));   expect(query.need_to_update).toBe(false)
        runInAction(() => query.need_to_update = false);    expect(query.need_to_update).toBe(false)
        runInAction(() => query.order_by.set('b', ASC));    expect(query.need_to_update).toBe(true)
        runInAction(() => query.need_to_update = false);    expect(query.need_to_update).toBe(false)
        runInAction(() => query.order_by.delete('a'));      expect(query.need_to_update).toBe(true)
        runInAction(() => query.need_to_update = false);    expect(query.need_to_update).toBe(false)
    })

    describe('pagination', () => {
        it('setPage', async () => {
                                      expect([query.limit, query.offset]).toMatchObject([50, 0])
            query.setPage(0)        ; expect([query.limit, query.offset]).toMatchObject([50, 0])
            query.setPage(1)        ; expect([query.limit, query.offset]).toMatchObject([50, 0])
            query.setPage(2)        ; expect([query.limit, query.offset]).toMatchObject([50, 50])

            query.setPageSize(10)   ; expect([query.limit, query.offset]).toMatchObject([10, 0])
            query.setPage(1)        ; expect([query.limit, query.offset]).toMatchObject([10, 0])
            query.setPage(2)        ; expect([query.limit, query.offset]).toMatchObject([10, 10])
            query.setPage(3)        ; expect([query.limit, query.offset]).toMatchObject([10, 20])
        })
        it('setPageSize', async () => {
                                      expect([query.limit, query.offset]).toMatchObject([50, 0])
            query.setPageSize(10)   ; expect([query.limit, query.offset]).toMatchObject([10, 0])
            query.setPage(10)       ; expect([query.limit, query.offset]).toMatchObject([10, 90])
            query.setPageSize(20)   ; expect([query.limit, query.offset]).toMatchObject([20, 0])
        })
        it('goToFirstPage', async () => {
                                      expect([query.limit, query.offset]).toMatchObject([50, 0])
            query.setPage(10)       ; expect([query.limit, query.offset]).toMatchObject([50, 450])
            query.goToFirstPage()   ; expect([query.limit, query.offset]).toMatchObject([50, 0])
            query.goToFirstPage()   ; expect([query.limit, query.offset]).toMatchObject([50, 0])
            query.setPageSize(10)   ; expect([query.limit, query.offset]).toMatchObject([10, 0])
            query.setPage(10)       ; expect([query.limit, query.offset]).toMatchObject([10, 90])
            query.goToFirstPage()   ; expect([query.limit, query.offset]).toMatchObject([10, 0])
        })
        it('goToPrevPage', async () => {
                                      expect([query.limit, query.offset]).toMatchObject([50, 0])
            query.goToPrevPage()    ; expect([query.limit, query.offset]).toMatchObject([50, 0])
            query.setPage(10)       ; expect([query.limit, query.offset]).toMatchObject([50, 450])
            query.goToPrevPage()    ; expect([query.limit, query.offset]).toMatchObject([50, 400])
            query.goToPrevPage()    ; expect([query.limit, query.offset]).toMatchObject([50, 350])
            query.setPageSize(10)   ; expect([query.limit, query.offset]).toMatchObject([10, 0])
            query.setPage(10)       ; expect([query.limit, query.offset]).toMatchObject([10, 90])
            query.goToPrevPage()    ; expect([query.limit, query.offset]).toMatchObject([10, 80])
        })
        it('goToNextPage', async () => {
                                      expect([query.limit, query.offset]).toMatchObject([50, 0])
            query.goToNextPage()    ; expect([query.limit, query.offset]).toMatchObject([50, 50])
            query.setPage(10)       ; expect([query.limit, query.offset]).toMatchObject([50, 450])
            query.goToNextPage()    ; expect([query.limit, query.offset]).toMatchObject([50, 500])
            query.goToNextPage()    ; expect([query.limit, query.offset]).toMatchObject([50, 550])
            query.setPageSize(10)   ; expect([query.limit, query.offset]).toMatchObject([10, 0])
            query.setPage(10)       ; expect([query.limit, query.offset]).toMatchObject([10, 90])
            query.goToNextPage()    ; expect([query.limit, query.offset]).toMatchObject([10, 100])
        })
        it('goToLastPage', async () => {
                                      expect([query.limit, query.offset]).toMatchObject([50, 0])
            query.goToLastPage()    ; expect([query.limit, query.offset]).toMatchObject([50, 0])

            query.setPage(10)       ; expect([query.limit, query.offset]).toMatchObject([50, 450])
            query.goToLastPage()    ; expect([query.limit, query.offset]).toMatchObject([50, 0])

            query.total = 50 
            query.goToLastPage()    ; expect([query.limit, query.offset]).toMatchObject([50, 0])

            query.total = 51 
            query.goToLastPage()    ; expect([query.limit, query.offset]).toMatchObject([50, 50])

            query.setPageSize(10)   ; expect([query.limit, query.offset]).toMatchObject([10, 0])
            query.setPage(10)       ; expect([query.limit, query.offset]).toMatchObject([10, 90])
            query.goToLastPage()    ; expect([query.limit, query.offset]).toMatchObject([10, 50])

            query.total = 50 
            query.goToLastPage()    ; expect([query.limit, query.offset]).toMatchObject([10, 40])
        })
        it('is_first_page', async () => {
                                      expect(query.is_first_page).toBe(true)
            query.setPage(0)        ; expect(query.is_first_page).toBe(true)
            query.setPage(1)        ; expect(query.is_first_page).toBe(true)
            query.setPage(2)        ; expect(query.is_first_page).toBe(false)
        })
        it('is_last_page', async () => {
                                      expect(query.is_last_page).toBe(true)
            query.setPage(0)        ; expect(query.is_last_page).toBe(true)
            query.setPage(1)        ; expect(query.is_last_page).toBe(true)
            query.setPage(2)        ; expect(query.is_last_page).toBe(true)
            query.total = 1000      ; expect(query.is_last_page).toBe(false)
        })
        it('current_page', async () => {
                                      expect(query.current_page).toBe(1)
            query.setPage(-1)       ; expect(query.current_page).toBe(1)
            query.setPage(0)        ; expect(query.current_page).toBe(1)
            query.setPage(1)        ; expect(query.current_page).toBe(1)
            query.setPage(2)        ; expect(query.current_page).toBe(2)
        })
        it('total_pages', async () => {
                                      expect(query.total_pages).toBe(1)
            query.total = 50        ; expect(query.total_pages).toBe(1)
            query.total = 51        ; expect(query.total_pages).toBe(2)
            query.total = 100       ; expect(query.total_pages).toBe(2)
            query.total = 200       ; expect(query.total_pages).toBe(4)
        })
    })

    it('e2e', async () => {
        expect(adapter_load).toHaveBeenCalledTimes(0) 
        await query.load()
        expect(adapter_load).toHaveBeenCalledTimes(1) 
        expect(adapter_load).toHaveBeenCalledWith(query.selector)
        expect(query.items).toEqual([
            cache.get(obj_a.id),
            cache.get(obj_b.id),
            cache.get(obj_c.id),
            cache.get(obj_d.id),
            cache.get(obj_e.id),
        ])

        query.setPage(2)
        expect(query.items).toEqual([
            cache.get(obj_a.id),
            cache.get(obj_b.id),
            cache.get(obj_c.id),
            cache.get(obj_d.id),
            cache.get(obj_e.id),
        ])

        await query.load()
        expect(adapter_load).toHaveBeenCalledTimes(2) 
        expect(adapter_load).toHaveBeenCalledWith(query.selector)
        expect(query.items).toEqual([])

        // TODO: check local adapter
        // query.setPageSize(2)
        // await query.load()
        // expect(query.items).toEqual([
        //     cache.get(obj_c.id),
        //     cache.get(obj_d.id),
        // ])
    })
})
