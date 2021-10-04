import { model, Model } from '../model'
import id from '../fields/id'
import field from '../fields/field'
import { rest, RestAdapter } from './rest'

// TODO

describe('Adapter: Rest', () => {

    it('init', async ()=> {
        // let http_mock = {} 
        // class A {} 
        // let adapter = new RestAdapter(A, http_mock, 'test')

        // expect((<any>adapter).cls).toBe(A)
        // expect((<any>adapter).http).toBe(http_mock)
        // expect((<any>adapter).api).toBe('test')
    })

    // it('init (decorator)', async ()=> {
    //     let http_mock = {} 

    //     @rest(http_mock, 'test')
    //     @model class A extends Model {}

    //     // I cannot test it, constructor A was overridden in @model
    //     // expect((<any>A).adapter.cls.name).toBe('A')
    //     expect((<any>A).adapter.http).toBe(http_mock)
    //     expect((<any>A).adapter.api).toBe('test')
    // })

    // it('save (create)', async ()=> {
    //     let http_mock = {post: async (url, data)=>{}}
    //     let post = jest.spyOn(http_mock, 'post').mockImplementation(
    //         async (url, data) => {
    //             data.id = 1 
    //             return data
    //         })

    //     @rest(http_mock, 'test')
    //     @model class A extends Model {
    //         @id    id: number
    //         @field  a: string
    //     }
    //     let a = new A({a: 'test'})

    //     await a.save()
    //     expect(post).toHaveBeenCalledTimes(1)
    //     // warning! post was not called the "post" with id:1, jest save the "a" in the "post" 
    //     // but the "a" have id:1 in current step
    //     expect(post).toHaveBeenCalledWith('test/', {id: 1, a: 'test'})
    //     // TODO: fix the error
    //     // expect(a.id).not.toBeNull()
    // })

    // it('save (edit)', async ()=> {
    //     let http_mock = {put: async (url, data)=>{}}
    //     let put = jest.spyOn(http_mock, 'put').mockImplementation(
    //         async (url, data) => {
    //             data.id = 1 
    //             return data
    //         })

    //     @rest(http_mock, 'test')
    //     @model class A extends Model {
    //         @id    id: number
    //         @field  a: string
    //     }
    //     let a = new A({id: 1, a: 'test'})

    //     await a.save()
    //     expect(a).toMatchObject({id: 1, a: 'test'})
    //     expect(put).toHaveBeenCalledTimes(1)
    //     expect(put).toHaveBeenCalledWith('test/1/', {id: 1, a: 'test'})
    // })

    // it('delete', async ()=> {
    //     let http_mock = {delete: async (url)=>{}}
    //     let del = jest.spyOn(http_mock, 'delete').mockImplementation(
    //         async (url) => {
    //             return
    //         })

    //     @rest(http_mock, 'test')
    //     @model class A extends Model {
    //         @id    id: number
    //     }
    //     let a = new A({id: 1})

    //     await a.delete()
    //     expect(a.__id).toBeNull()
    //     expect(del).toHaveBeenCalledTimes(1)
    //     expect(del).toHaveBeenCalledWith('test/1/')
    // })

    // it('load', async ()=> {
    //     let http_mock = {get: async (url): Promise<any[]> => {return}}
    //     let get = jest.spyOn(http_mock, 'get').mockImplementation(
    //         async (url) => {
    //             return [
    //                 {id: 1, a: 'a'},
    //                 {id: 2, a: 'b'},
    //             ]
    //         })

    //     @rest(http_mock, 'test')
    //     @model class A extends Model {
    //         @id    id: number
    //         @field  a: string
    //     }
    //     let adapter: RestAdapter<A> = (<any>A).adapter

    //     let objs: A[] = await adapter.load()
    //     expect(http_mock.get).toHaveBeenCalledTimes(1)
    //     expect(http_mock.get).toHaveBeenCalledWith('test/?')
    //     expect(objs.length).toBe(2)
    //     expect(objs[0]).toMatchObject({id: 1, a: 'a'})
    //     // expect(objs[0] instanceof A).toBeTruthy()
    //     expect(objs[1]).toMatchObject({id: 2, a: 'b'})
    //     // expect(objs[1] instanceof A).toBeTruthy()
    // })

})