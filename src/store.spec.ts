import store, { ModelDescription } from './store'


describe('Store', () => {

    beforeEach(() => {
        store.reset()
    })

    it('Register model', async ()=> {
        let model_name_a = 'A'
        let model_name_b = 'B'

        // register model A
        expect(store.models[model_name_a]).toBeUndefined()
        store.registerModel(model_name_a);   
        expect(store.models[model_name_a]).toEqual(new ModelDescription())

        // register model B 
        expect(store.models[model_name_b]).toBeUndefined()
        store.registerModel(model_name_b);   
        expect(store.models[model_name_b]).toEqual(new ModelDescription())

        // again register model A
        expect(() => { store.registerModel(model_name_a)})
            .toThrow(new Error(`Model "${model_name_a}" already registered.`))
    })

    it('Register field type', async ()=> {
        let field_type_a = 'field_type_a'
        let field_type_b = 'field_type_b'

        // register type A
        expect(store.field_types[field_type_a]).toBeUndefined()
        store.registerFieldType(field_type_a, () => {});  
        expect(typeof store.field_types[field_type_a]).toBe('function')

        // register type B 
        expect(store.field_types[field_type_b]).toBeUndefined()
        store.registerFieldType(field_type_b, () => {});  
        expect(typeof store.field_types[field_type_b]).toBe('function')

        // again register type A 
        expect(() => { store.registerFieldType(field_type_a, () => {})})
            .toThrow(new Error(`Field type "${field_type_a}" already registered.`))
    })

    it('Register field in the model', async ()=> {
        let model_name = 'A'
        let field_type = 'field'
        let field_name_a = 'xxx'
        let field_name_b = 'yyy'
        store.registerModel(model_name)
        store.registerFieldType(field_type, () => {})

        // register field A 
        expect(store.models[model_name].fields[field_name_a]).toBeUndefined()
        store.registerModelField(model_name, field_type, field_name_a, {test: 1})
        // TODO: use one to Equal statement
        expect(store.models[model_name].fields[field_name_a].type).toBe(field_type)
        expect(store.models[model_name].fields[field_name_a].settings).toEqual({test: 1})

        // register field B
        expect(store.models[model_name].fields[field_name_b]).toBeUndefined()
        store.registerModelField(model_name, field_type, field_name_b, {test: 1})
        // TODO: use one to Equal statement
        expect(store.models[model_name].fields[field_name_b].type).toBe(field_type)
        expect(store.models[model_name].fields[field_name_b].settings).toEqual({test: 1})

        // again register field A 
        expect(() => { store.registerModelField(model_name, field_type, field_name_a)})
            .toThrow(new Error(`Field "${field_name_a}" on "${model_name}" already registered.`))
    })

    it('Register id field in the model', async ()=> {
        let model_name = 'A'
        let field_type = 'field'
        let field_name_a = 'xxx'
        let field_name_b = 'yyy'
        store.registerModel(model_name)
        store.registerFieldType(field_type, () => {})
        store.registerModelField(model_name, field_type, field_name_a)
        store.registerModelField(model_name, field_type, field_name_b)

        // register id A
        expect(store.models[model_name].ids.length).toBe(0)
        store.registerId(model_name, field_name_a)
        expect(store.models[model_name].ids[0]).toBe(field_name_a)

        // register id B
        expect(store.models[model_name].ids.length).toBe(1)
        store.registerId(model_name, field_name_b)
        expect(store.models[model_name].ids[1]).toBe(field_name_b)

        // again register id A
        expect(() => { store.registerId(model_name, field_name_a)})
            .toThrow(new Error(`Id "${field_name_a}" in model "${model_name}" already registered.`))
    })

    // TODO
    // it('Inject obj', async ()=> {
    // })

    // TODO
    // it('Eject obj', async ()=> {
    // })
    
    // TODO
    // it('Eject: ignore object without __id', async ()=> {
    //     // store.eject(<any>{__id: null})
    // })

    // TODO
    // it('Get ID string', async ()=> {
    // })

    it('Reset', async ()=> {
        let model_name = 'A'
        let field_type = 'typeA'
        store.registerModel(model_name);    
        store.registerFieldType(field_type, () => {});  

        store.reset(); 
        expect(store.models).toEqual({})
        expect(store.field_types).not.toEqual({})

        store.reset() // should not be an exception
    })

    // TODO
    // it('Reset All Cache', async ()=> {
    // })

    // TODO
    // it('Remove model', async ()=> {
    // })

    // TODO
    // it('Clear cache for the model', async ()=> {
    // })
})
