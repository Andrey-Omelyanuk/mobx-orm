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

declare enum FilterType {
    EQ = 0,
    NOT_EQ = 1,
    IN = 2,
    NOT_IN = 3,
    AND = 4,
    OR = 5
}
declare class Filter {
    readonly field: string;
    type: FilterType;
    value: any;
    options: Query$1<any>;
    constructor(type?: FilterType, field?: string, value?: any);
    setFromURI(uri: string): string;
    getURIField(): string;
    getURLSearchParams(): URLSearchParams;
    is_match(obj: any): boolean;
}
declare function EQ(field: string, value?: any): Filter;
declare function IN(field: string, value?: any[]): Filter;
declare function AND(...filters: Filter[]): Filter;
declare function OR(...filters: Filter[]): Filter;

declare abstract class Query$2<M extends Model> {
    filters: Filter;
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
    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: string[], page?: number, page_size?: number);
    destroy(): void;
    abstract __load(objs: M[]): any;
    load(): Promise<void>;
    shadowLoad(): Promise<void>;
    ready(): Promise<Boolean>;
    loading(): Promise<Boolean>;
}

declare class Query$1<M extends Model> extends Query$2<M> {
    __load(objs: M[]): void;
    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: string[]);
    private watch_obj;
}

declare class Query<M extends Model> extends Query$2<M> {
    __load(objs: M[]): void;
    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: string[], page?: number, page_size?: number);
}

declare type RawObject = any;
declare abstract class Model {
    static __id_separator: string;
    static __adapter: Adapter<Model>;
    static __cache: Map<string, Model>;
    static __ids: Map<string, {
        decorator: (obj: Model, field_name: string) => void;
        settings: any;
        serialize: any;
        deserialize: any;
    }>;
    static __fields: {
        [field_name: string]: {
            decorator: (obj: Model, field_name: string) => void;
            settings: any;
            serialize: any;
            deserialize: any;
        };
    };
    static __relations: {
        [field_name: string]: {
            decorator: (obj: Model, field_name: string) => void;
            settings: any;
        };
    };
    static inject(obj: Model): void;
    static eject(obj: Model): void;
    static find(filters: Filter): Promise<Model>;
    static getQuery(filters?: Filter, order_by?: string[]): Query$1<Model>;
    static getQueryPage(filter?: Filter, order_by?: string[], page?: number, page_size?: number): Query<Model>;
    static get(__id: string): Model;
    static filter(): Array<Model>;
    static updateCache(raw_obj: any): Model;
    static clearCache(): void;
    static __id(obj: any, ids?: any): string | null;
    __init_data: any;
    __disposers: Map<any, any>;
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

export { AND, Adapter, EQ, Filter, FilterType, IN, LocalAdapter, Model, OR, Query$1 as Query, Query$2 as QueryBase, Query as QueryPage, RawObject, field, foreign, id, local, many, model, one };
