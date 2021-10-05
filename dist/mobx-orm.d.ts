declare type RawObject$1 = any;
declare abstract class Adapter<M extends Model> {
    abstract __create(obj: RawObject$1): Promise<object>;
    abstract __update(obj: RawObject$1): Promise<object>;
    abstract __delete(obj: RawObject$1): Promise<object>;
    abstract __load(where?: any, order_by?: any, limit?: any, offset?: any): Promise<RawObject$1[]>;
    readonly model: any;
    constructor(model: any);
    create(obj: M): Promise<M>;
    update(obj: M): Promise<M>;
    delete(obj: M): Promise<M>;
    load(where?: any, order_by?: any, limit?: any, offset?: any): Promise<M[]>;
}

declare abstract class Query$2<M extends Model> {
    filters: object;
    order_by: string[];
    page: number;
    page_size: number;
    get items(): M[];
    get is_loading(): boolean;
    get error(): string;
    readonly __base_cache: any;
    readonly __adapter: Adapter<M>;
    __items: M[];
    __is_loading: boolean;
    __error: string;
    __disposers: any[];
    __disposer_objects: {};
    constructor(adapter: Adapter<M>, base_cache: any, filters?: object, order_by?: string[], page?: number, page_size?: number);
    destroy(): void;
    abstract __load(objs: M[]): any;
    load(): Promise<void>;
    ready(): Promise<Boolean>;
    __is_matched(obj: any): boolean;
}

declare class Query$1<M extends Model> extends Query$2<M> {
    __load(objs: M[]): void;
    constructor(adapter: Adapter<M>, base_cache: any, filters?: object, order_by?: string[], page?: number, page_size?: number);
    private watch_obj;
}

declare abstract class Model {
    private static id_separator;
    private static adapter;
    private static cache;
    private static ids;
    private static fields;
    private static relations;
    static inject(obj: Model): void;
    static eject(obj: Model): void;
    static load(filters?: any, order_by?: string[]): Query$2<Model>;
    static loadPage(filter?: any, order_by?: string[], page?: number, page_size?: number): Query$1<Model>;
    static updateCache(raw_obj: any): Model;
    static clearCache(): void;
    static __id(obj: any, ids?: any): string | null;
    private readonly __init_data;
    private disposers;
    constructor(...args: any[]);
    get __id(): string | null;
    get model(): any;
    get raw_obj(): any;
    get is_changed(): boolean;
    create(): Promise<any>;
    update(): Promise<any>;
    delete(): Promise<any>;
    save(): Promise<any>;
    updateFromRaw(raw_obj: any): void;
}
declare function model(constructor: any): any;

declare class Query<M extends Model> extends Query$2<M> {
    __load(objs: M[]): void;
    constructor(adapter: Adapter<M>, base_cache: any, filters?: object, order_by?: string[]);
    private watch_obj;
}

declare type RawObject = any;
declare class LocalAdapter<M extends Model> extends Adapter<M> {
    readonly store_name: string;
    constructor(model: any);
    __create(obj: RawObject): Promise<RawObject>;
    __update(obj: RawObject): Promise<RawObject>;
    __delete(obj: RawObject): Promise<RawObject>;
    __load(where?: any, order_by?: any, limit?: any, offset?: any): Promise<RawObject[]>;
}
declare function local(): (cls: any) => void;

declare function id(cls: any, field_name: string): void;

declare function field(cls: any, field_name: string): void;

declare function foreign(foreign_model: any, ...foreign_ids_names: string[]): (cls: any, field_name: string) => void;

declare function one(remote_model: any, ...remote_foreign_ids_names: string[]): (cls: any, field_name: string) => void;

declare function many(remote_model: any, ...remote_foreign_ids_names: string[]): (cls: any, field_name: string) => void;

export { Adapter, LocalAdapter, Model, Query, Query$2 as QueryBase, Query$1 as QueryPage, field, foreign, id, local, many, model, one };
