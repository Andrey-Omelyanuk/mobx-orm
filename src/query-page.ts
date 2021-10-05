import { action, autorun, computed, makeObservable, observable, observe, reaction, runInAction } from "mobx"
import { Model } from "./model"
import Adapter from "./adapters/adapter"
import QueryBase from './query-base'

/*
Поведение реактивности items

actions:
    - удаление объекта который в items -> update() ? or just delete from items?
    - добавление в кэш
        - попадание по фильтрам -> update() ? or show `query should to update`?
    - изменение в кэш
        - не было но уже    попадание по фильтрам -> update()  ? or show `query should to update`?
        -    было но уже не попадание по фильтрам -> update() ? or show `query should to update`?

need_to_update = 
auto_update = 
*/

// TODO get total count - we need to count pages num

export default class Query<M extends Model> extends QueryBase<M> {

    __load(objs: M[]) {
        runInAction(() => { 
            this.__items.splice(0, this.__items.length)
            this.__items.push(...objs)
        })
    }

    constructor(adapter: Adapter<M>, base_cache: any, filters?: object, order_by?: string[], page?: number, page_size?: number) {
        super(adapter, base_cache, filters, order_by)
        if(this.page === undefined) this.page = 0
        if(this.page_size === undefined) this.page_size = 50

        this.load() // load when query is created

        // update if query is changed
        this.__disposers.push(reaction(
            () => { return { 
                filter          : this.filters, 
                order_by        : this.order_by, 
                page            : this.page, 
                page_size       : this.page_size,
             }},
            () => { this.load() }
        ))

        // // watch the cache for changes, and update items if needed
        // this.__disposers.push(observe(this.__base_cache, (change: any) => {
        //     if (change.type == 'add') {
        //         this.watch_obj(change.newValue)
        //     }
        //     if (change.type == "delete") {
        //         let __id = change.name
        //         let obj  = change.oldValue
        //         this.__disposer_objects[__id]()
        //         delete this.__disposer_objects[__id]
        //         let i = this.items.indexOf(obj)
        //         if (i != -1)
        //             runInAction(() => {
        //                 this.items.splice(i, 1)
        //             })
        //     }
        // }))

        // // watch all exist objects of model 
        // for(let [id, obj] of this.__base_cache) {
        //     this.watch_obj(obj)
        // }
    }

    //
    private watch_obj(obj) {
        this.__disposer_objects[obj.__id] = autorun(
            () => {
                let should_be_in_the_list = this.__is_matched(obj)
                if (should_be_in_the_list) {
                    let i = this.items.indexOf(obj)
                    if (should_be_in_the_list && i == -1)
                        runInAction(() => this.items.push(obj))
                        
                    if (!should_be_in_the_list && i != -1)
                        runInAction(() => this.items.splice(i, 1))
                }
            })
    }

}

