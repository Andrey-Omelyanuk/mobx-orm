import { Selector } from '@/types';
import { Adapter } from './adapter'


describe('Adapter', () => {

    class A { x: string }
    let obj_a = new A()
    let obj_b = new A()

    class TestAdapter extends Adapter<A> {
        async __load(selector: Selector) : Promise<A[]> { return [obj_a, obj_b] }
        async getTotalCount(where?): Promise<number> { return 0; }
    }
    let adapter = new TestAdapter()
    let __load: any

    beforeAll(() => {
        __load = jest.spyOn(adapter, '__load')
    })

    afterEach(async () => {
        jest.clearAllMocks()
    })

    it('load', async ()=> {
                                            expect(__load).toHaveBeenCalledTimes(0)
        let items = await adapter.load();   expect(__load).toHaveBeenCalledTimes(1)
                                            expect(__load).toHaveBeenCalledWith(undefined)
                                            expect(items).toEqual([obj_a, obj_b, ])
    })
})
