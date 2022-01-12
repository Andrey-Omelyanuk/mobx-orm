declare abstract class Adapter<M extends Model> {
    abstract __create(obj: RawObject): Promise<object>;
    abstract __update(obj: RawObject): Promise<object>;
    abstract __delete(obj: RawObject): Promise<object>;
    abstract __find(where: any): Promise<object>;
    abstract __load(where?: any, order_by?: any, limit?: any, offset?: any): Promise<RawObject[]>;
    abstract getTotalCount(where?: any): Promise<number>;
    readonly model: any;
    constructor(model: any);
    create(obj: M): Promise<M>;
    update(obj: M): Promise<M>;
    delete(obj: M): Promise<M>;
    find(where: any): Promise<M>;
    load(where?: any, order_by?: any, limit?: any, offset?: any): Promise<M[]>;
}

declare abstract class Query$2<M extends Model> {
    filters: object;
    order_by: string[];
    page: number;
    page_size: number;
    get items(): M[];
    get is_loading(): boolean;
    get is_ready(): boolean;
    get error(): string;
    readonly __base_cache: any;
    readonly __adapter: Adapter<M>;
    __items: M[];
    __is_loading: boolean;
    __is_ready: boolean;
    __error: string;
    __disposers: any[];
    __disposer_objects: {};
    constructor(adapter: Adapter<M>, base_cache: any, filters?: object, order_by?: string[], page?: number, page_size?: number);
    destroy(): void;
    abstract __load(objs: M[]): any;
    load(): Promise<void>;
    shadowLoad(): Promise<void>;
    ready(): Promise<Boolean>;
    loading(): Promise<Boolean>;
    __is_matched(obj: any): boolean;
}

declare class Query$1<M extends Model> extends Query$2<M> {
    __load(objs: M[]): void;
    constructor(adapter: Adapter<M>, base_cache: any, filters?: object, order_by?: string[]);
    private watch_obj;
}

declare class Query<M extends Model> extends Query$2<M> {
    __load(objs: M[]): void;
    constructor(adapter: Adapter<M>, base_cache: any, filters?: object, order_by?: string[], page?: number, page_size?: number);
}

declare type RawObject = any;
declare abstract class Model {
    private static id_separator;
    private static adapter;
    private static cache;
    private static ids;
    private static fields;
    private static relations;
    static inject(obj: Model): void;
    static eject(obj: Model): void;
    static find(filters: any): Promise<Model>;
    static load(filters?: any, order_by?: string[]): Query$1<Model>;
    static loadPage(filter?: any, order_by?: string[], page?: number, page_size?: number): Query<Model>;
    static get(__id: string): Model;
    static updateCache(raw_obj: any): Model;
    static clearCache(): void;
    static __id(obj: any, ids?: any): string | null;
    private __init_data;
    private disposers;
    constructor(...args: any[]);
    get __id(): string | null;
    get model(): any;
    get raw_obj(): any;
    get raw_data(): any;
    get is_changed(): boolean;
    create(): Promise<any>;
    update(): Promise<any>;
    delete(): Promise<any>;
    save(): Promise<any>;
    refresh_init_data(): void;
    updateFromRaw(raw_obj: any): void;
}
declare function model(constructor: any): any;

declare class LocalAdapter<M extends Model> extends Adapter<M> {
    readonly store_name: string;
    delay: number;
    init_local_data(data: RawObject[]): void;
    constructor(model: any, store_name?: string);
    __create(obj: RawObject): Promise<RawObject>;
    __update(obj: RawObject): Promise<RawObject>;
    __delete(obj: RawObject): Promise<RawObject>;
    __find(where: any): Promise<RawObject>;
    __load(where?: any, order_by?: any, limit?: any, offset?: any): Promise<RawObject[]>;
    getTotalCount(where?: any): Promise<number>;
}
declare function local(): (cls: any) => void;

declare function id(cls: any, field_name: string): void;

declare function field(cls: any, field_name: string): void;

declare function foreign(foreign_model: any, ...foreign_ids_names: string[]): (cls: any, field_name: string) => void;

declare function one(remote_model: any, ...remote_foreign_ids_names: string[]): (cls: any, field_name: string) => void;

declare function many(remote_model: any, ...remote_foreign_ids_names: string[]): (cls: any, field_name: string) => void;

export { Adapter, LocalAdapter, Model, Query$1 as Query, Query$2 as QueryBase, Query as QueryPage, RawObject, field, foreign, id, local, many, model, one };
