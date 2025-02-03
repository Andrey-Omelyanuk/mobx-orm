import { Model, model, local} from '..'
import { QueryPage } from './query-page'


describe('QueryPage', () => {

    @local() @model class A extends Model {}
    let query: QueryPage<A>

    beforeEach(async () => {
        query = new QueryPage<A>({repository: A.repository})
    })

    afterEach(async () => {
        query.destroy()
        A.repository.cache.clear() 
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('default', async () => {
            expect(query).toMatchObject({
                repository      : A.repository,
                items           : [],
                total           : undefined,
            })
            expect(query.offset.value).toBe(0)
            expect(query.limit.value).toBe(50)
        })
    })

    describe('Load', () => {
        it('default', async () => {
            await query.load()
            expect(query).toMatchObject({
                repository      : A.repository,
                items           : [],
                total           : 0,        // empty data set, 0 is a proof that load is done correctly
            })
        })
    })

    describe('Pagination', () => {
        it('setPage', async () => {
                                      expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])
            query.setPage(0)        ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])
            query.setPage(1)        ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])
            query.setPage(2)        ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 50])

            query.setPageSize(10)   ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 0])
            query.setPage(1)        ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 0])
            query.setPage(2)        ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 10])
            query.setPage(3)        ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 20])
        })
        it('setPageSize', async () => {
                                      expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])
            query.setPageSize(10)   ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 0])
            query.setPage(10)       ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 90])
            query.setPageSize(20)   ; expect([query.limit.value, query.offset.value]).toMatchObject([20, 0])
        })
        it('goToFirstPage', async () => {
                                      expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])
            query.setPage(10)       ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 450])
            query.goToFirstPage()   ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])
            query.goToFirstPage()   ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])
            query.setPageSize(10)   ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 0])
            query.setPage(10)       ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 90])
            query.goToFirstPage()   ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 0])
        })
        it('goToPrevPage', async () => {
                                      expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])
            query.goToPrevPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])
            query.setPage(10)       ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 450])
            query.goToPrevPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 400])
            query.goToPrevPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 350])
            query.setPageSize(10)   ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 0])
            query.setPage(10)       ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 90])
            query.goToPrevPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 80])
        })
        it('goToNextPage', async () => {
                                      expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])
            query.goToNextPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 50])
            query.setPage(10)       ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 450])
            query.goToNextPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 500])
            query.goToNextPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 550])
            query.setPageSize(10)   ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 0])
            query.setPage(10)       ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 90])
            query.goToNextPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 100])
        })
        it('goToLastPage', async () => {
                                      expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])
            query.goToLastPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])

            query.setPage(10)       ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 450])
            query.goToLastPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])

            query.total = 50 
            query.goToLastPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 0])

            query.total = 51 
            query.goToLastPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([50, 50])

            query.setPageSize(10)   ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 0])
            query.setPage(10)       ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 90])
            query.goToLastPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 50])

            query.total = 50 
            query.goToLastPage()    ; expect([query.limit.value, query.offset.value]).toMatchObject([10, 40])
        })
        it('is_first_page', async () => {
            query.total = 50        ; expect(query.is_first_page).toBe(true)
            query.setPage(0)        ; expect(query.is_first_page).toBe(true)
            query.setPage(1)        ; expect(query.is_first_page).toBe(true)
            query.setPage(2)        ; expect(query.is_first_page).toBe(false)
        })
        it('is_last_page', async () => {
            query.total = 50        ; expect(query.is_last_page).toBe(true)
            query.setPage(0)        ; expect(query.is_last_page).toBe(true)
            query.setPage(1)        ; expect(query.is_last_page).toBe(true)
            query.setPage(2)        ; expect(query.is_last_page).toBe(true)
            query.total = 1000      ; expect(query.is_last_page).toBe(false)
        })
        it('current_page', async () => {
            query.total = 50        ; expect(query.current_page).toBe(1)
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
})
