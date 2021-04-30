import { store, model, Model, id, DefaultAdapter } from '../index'


describe('DefaultAdapter', () => {

    store.reset()
    @model class SN  extends Model { @id id : number }                      // Single Number
    @model class SS  extends Model { @id id : string }                      // Single String
    @model class CNN extends Model { @id id1: number; @id id2: number }     // Composite Numbers
    @model class CSS extends Model { @id id1: string; @id id2: string }     // Composite Strings
    @model class CNS extends Model { @id id1: number; @id id2: string }     // Composite Number+String

    beforeEach(() => {
        store.clearCacheForModel('SN')
        store.clearCacheForModel('SS')
        store.clearCacheForModel('CNN')
        store.clearCacheForModel('CSS')
        store.clearCacheForModel('CNS')
    })

    it('save', async () => {
        let adapter_sn = new DefaultAdapter()
        let sn1 = new SN();           expect(sn1.id).toBeNull()
        let sn2 = new SN();           expect(sn2.id).toBeNull()
        await adapter_sn.save(sn1);   expect(sn1.id).toBe(0)
        await adapter_sn.save(sn2);   expect(sn2.id).toBe(1)
                                      expect(SN.all().length).toBe(2)
        // second save is update => nothing change in current case
        await adapter_sn.save(sn1);   expect(sn1.id).toBe(0)
        await adapter_sn.save(sn2);   expect(sn2.id).toBe(1)
                                      expect(SN.all().length).toBe(2)

        let adapter_cnn = new DefaultAdapter()
        let cnn1 = new CNN();         expect(cnn1.id1).toBeNull(); expect(cnn1.id2).toBeNull()
        let cnn2 = new CNN();         expect(cnn2.id1).toBeNull(); expect(cnn2.id2).toBeNull()
        await adapter_cnn.save(cnn1); expect(cnn1.id1).toBe(0);    expect(cnn1.id2).toBe(0)
        await adapter_cnn.save(cnn2); expect(cnn2.id1).toBe(1);    expect(cnn2.id2).toBe(1)
                                      expect(CNN.all().length).toBe(2)
        // second save is update => nothing change in current case
        await adapter_cnn.save(cnn1); expect(cnn1.id1).toBe(0);    expect(cnn1.id2).toBe(0)
        await adapter_cnn.save(cnn2); expect(cnn2.id1).toBe(1);    expect(cnn2.id2).toBe(1)
                                      expect(CNN.all().length).toBe(2)
    })

    it('delete', async () => {
        let adapter_sn = new DefaultAdapter()
        let sn1 = new SN()
        let sn2 = new SN()
        await adapter_sn.save(sn1);    expect(sn1.id).toBe(0)
        await adapter_sn.save(sn2);    expect(sn2.id).toBe(1)
                                       expect(SN.all().length).toBe(2)
        await adapter_sn.delete(sn1);  expect(sn1.id).toBeNull()
        await adapter_sn.delete(sn2);  expect(sn2.id).toBeNull()
                                       expect(SN.all().length).toBe(0)

        let adapter_cnn = new DefaultAdapter()
        let cnn1 = new CNN()
        let cnn2 = new CNN()
        await adapter_cnn.save(cnn1);    expect(cnn1.id1).toBe(0);    expect(cnn1.id2).toBe(0)
        await adapter_cnn.save(cnn2);    expect(cnn2.id1).toBe(1);    expect(cnn2.id2).toBe(1)
                                         expect(CNN.all().length).toBe(2)
        await adapter_cnn.delete(cnn1);  expect(cnn1.id1).toBeNull(); expect(cnn1.id2).toBeNull()
        await adapter_cnn.delete(cnn2);  expect(cnn2.id1).toBeNull(); expect(cnn2.id2).toBeNull()
                                         expect(CNN.all().length).toBe(0)
    })

    it('load', async () => {
        let adapter = new DefaultAdapter()
        try {
            await adapter.load()
        }
        catch (e) {
            expect(e).toEqual(new Error('Not Implemented for DefaultAdapter'))
        }
    })
})
